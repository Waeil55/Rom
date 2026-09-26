// Supabase Edge Function: generates AI-narrated audio for the Listen feature.
// Deploy with: supabase functions deploy tts
// Requires secret: supabase secrets set OPENAI_API_KEY=sk-...
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const STYLE_PROMPTS: Record<string, string> = {
  'read-exactly': 'Read the following pharmacy content aloud exactly as written, clearly and at a measured pace.',
  'explain-simply': 'Explain the following pharmacy content in simple, plain language a first-year student would understand.',
  'teach-professor': 'Teach the following pharmacy content the way a pharmacology professor would in a lecture, with context and emphasis on key points.',
  'exam-review': 'Summarize the following pharmacy content as a rapid exam-review script, emphasizing high-yield testable facts.',
  'clinical-explanation': 'Explain the following pharmacy content from a clinical practice perspective, focusing on real-world patient care implications.',
  'quick-review': 'Give a very brief, rapid-fire review of the key facts in the following pharmacy content.',
}

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

    const { text, style } = await req.json()
    if (!text || typeof text !== 'string' || text.length > 6000) {
      return new Response(JSON.stringify({ error: 'Invalid text payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const instruction = STYLE_PROMPTS[style] ?? STYLE_PROMPTS['explain-simply']
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured with OPENAI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openaiRes = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-audio-1.5',
        modalities: ['text', 'audio'],
        audio: { voice: 'alloy', format: 'mp3' },
        messages: [
          { role: 'system', content: instruction },
          { role: 'user', content: text },
        ],
        store: false,
      }),
    })

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text()
      return new Response(JSON.stringify({ error: 'Upstream TTS failure', detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = await openaiRes.json()
    const audioData = payload.choices?.[0]?.message?.audio?.data
    const transcript = payload.choices?.[0]?.message?.audio?.transcript ?? text

    if (!audioData) {
      return new Response(JSON.stringify({ error: 'No audio returned' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ audioBase64: audioData, format: 'mp3', transcript }), {
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
