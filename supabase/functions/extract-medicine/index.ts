// Supabase Edge Function: extracts structured medication data from pasted text or an uploaded
// photo/scan (label, package insert page, etc.) using an AI vision+text model with a strict JSON
// schema, so the admin always gets a clean, consistently-shaped draft to review before saving.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const MEDICINE_SCHEMA = {
  type: 'object',
  properties: {
    brandName: { type: 'string' },
    genericName: { type: 'string' },
    pronunciation: { type: 'string' },
    drugClass: { type: 'string' },
    mechanism: { type: 'string' },
    indications: { type: 'string' },
    dosage: { type: 'string' },
    contraindications: { type: 'string' },
    warnings: { type: 'string' },
    sideEffects: { type: 'string' },
    interactions: { type: 'string' },
    monitoring: { type: 'string' },
    counseling: { type: 'string' },
    pearls: { type: 'string' },
  },
  required: [
    'brandName',
    'genericName',
    'pronunciation',
    'drugClass',
    'mechanism',
    'indications',
    'dosage',
    'contraindications',
    'warnings',
    'sideEffects',
    'interactions',
    'monitoring',
    'counseling',
    'pearls',
  ],
  additionalProperties: false,
}

const SYSTEM_PROMPT = `You are a pharmacology data extraction assistant for a pharmacy student study app.
Given source material (a package insert, drug label photo, or reference text), extract structured
medication data into the given JSON schema. Rules:
- Use only information present in or directly inferable from the source. If a field genuinely cannot
  be determined, write "Not specified in source material." rather than guessing.
- Keep each field concise (1-4 sentences), written for board-exam study, not a full legal label copy.
- pronunciation: a simple phonetic guide, e.g. "am-LOH-di-peen".
- drugClass: use standard pharmacology class naming so it groups sensibly with existing drugs.
- pearls: 1-2 high-yield board-relevant facts about this drug.
- counseling: patient-facing counseling points, written as flowing text (not a list).
Return only the JSON object matching the schema — no commentary.`

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: userData, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { mode, content, imageBase64, mimeType } = body

    if (mode !== 'text' && mode !== 'image') {
      return new Response(JSON.stringify({ error: 'mode must be "text" or "image"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (mode === 'text' && (!content || typeof content !== 'string' || content.length > 20000)) {
      return new Response(JSON.stringify({ error: 'Invalid or oversized text content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (mode === 'image' && (!imageBase64 || typeof imageBase64 !== 'string')) {
      return new Response(JSON.stringify({ error: 'Missing image data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured with OPENAI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userContent =
      mode === 'image'
        ? [
            { type: 'text', text: 'Extract the medication data from this image.' },
            { type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } },
          ]
        : `Extract the medication data from this source text:\n\n${content}`

    const openaiRes = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'medicine_extraction', strict: true, schema: MEDICINE_SCHEMA },
        },
      }),
    })

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text()
      return new Response(JSON.stringify({ error: 'Upstream extraction failure', detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = await openaiRes.json()
    const raw = payload.choices?.[0]?.message?.content
    if (!raw) {
      return new Response(JSON.stringify({ error: 'No extraction returned' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const extracted = JSON.parse(raw)
    return new Response(JSON.stringify({ medicine: extracted }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
