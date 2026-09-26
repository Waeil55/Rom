// Supabase Edge Function: generates AI-narrated audio for the Listen feature.
// Deploy with: supabase functions deploy tts
// Requires secret: supabase secrets set OPENAI_API_KEY=sk-...
//
// Perf design: the old version used gpt-audio-1.5 (a heavy conversational model that does
// text understanding AND speech synthesis in one call) for every request. That's the slow
// path. Now:
//   - "read-exactly" skips text transformation entirely and goes straight to TTS (fastest).
//   - Every other style runs a fast, cheap text-only completion (gpt-4o-mini) to reshape the
//     script, then a dedicated TTS model (tts-1, optimized for low latency) synthesizes it.
// Audio is returned as raw binary (not base64 JSON) to cut payload size ~33% and skip the
// encode/decode step on both ends; the transcript rides along in a response header.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CHAT_URL = 'https://api.openai.com/v1/chat/completions'
const SPEECH_URL = 'https://api.openai.com/v1/audio/speech'
const RATE_LIMIT_MAX_REQUESTS = 30
const RATE_LIMIT_WINDOW_MINUTES = 60
const VALID_VOICES = new Set(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'])

const STYLE_PROMPTS: Record<string, string> = {
  'explain-simply': 'Explain the following pharmacy content in simple, plain language a first-year student would understand. Keep it concise and spoken-friendly.',
  'teach-professor': 'Teach the following pharmacy content the way a pharmacology professor would in a lecture, with context and emphasis on key points. Keep it concise and spoken-friendly.',
  'exam-review': 'Summarize the following pharmacy content as a rapid exam-review script, emphasizing high-yield testable facts. Keep it concise and spoken-friendly.',
  'clinical-explanation': 'Explain the following pharmacy content from a clinical practice perspective, focusing on real-world patient care implications. Keep it concise and spoken-friendly.',
  'quick-review': 'Give a very brief, rapid-fire review of the key facts in the following pharmacy content. Keep it short.',
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Expose-Headers': 'X-Transcript',
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

    const { text, style, voice, speed } = await req.json()
    if (!text || typeof text !== 'string' || text.length > 6000) {
      return new Response(JSON.stringify({ error: 'Invalid text payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const selectedVoice = VALID_VOICES.has(voice) ? voice : 'alloy'
    const speechSpeed = typeof speed === 'number' && speed >= 0.25 && speed <= 4 ? speed : 1

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count: recentCount, error: usageError } = await supabaseClient
      .from('tts_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userData.user.id)
      .gte('created_at', windowStart)

    if (usageError) {
      return new Response(JSON.stringify({ error: 'Rate limit check failed', detail: usageError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if ((recentCount ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({
          error: `Rate limit reached: max ${RATE_LIMIT_MAX_REQUESTS} narrations per ${RATE_LIMIT_WINDOW_MINUTES} minutes. Try again shortly.`,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server not configured with OPENAI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Step 1 (skipped for read-exactly): fast text reshape via a cheap, quick text model.
    let speechText = text
    const instruction = STYLE_PROMPTS[style]
    if (instruction) {
      const chatRes = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: instruction },
            { role: 'user', content: text },
          ],
          max_tokens: 700,
        }),
      })
      if (chatRes.ok) {
        const chatPayload = await chatRes.json()
        speechText = chatPayload.choices?.[0]?.message?.content ?? text
      }
      // If the reshape call fails for any reason, fall back to reading the original text
      // rather than failing the whole request.
    }

    // Step 2: dedicated low-latency TTS synthesis.
    const speechRes = await fetch(SPEECH_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'tts-1',
        voice: selectedVoice,
        input: speechText.slice(0, 4000),
        response_format: 'mp3',
        speed: speechSpeed,
      }),
    })

    if (!speechRes.ok) {
      const errBody = await speechRes.text()
      return new Response(JSON.stringify({ error: 'Upstream TTS failure', detail: errBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabaseClient.from('tts_usage').insert({ user_id: userData.user.id })

    const audioBuffer = await speechRes.arrayBuffer()
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'X-Transcript': encodeURIComponent(speechText.slice(0, 2000)),
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
