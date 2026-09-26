import { supabase, supabaseUrl, supabaseAnonKey } from './supabase'
import type { TeachingStyle } from './types'

export interface ListenResult {
  audioUrl: string
  transcript: string
}

export async function generateSpeech(
  text: string,
  style: TeachingStyle,
  voice: string,
  speed: number
): Promise<ListenResult> {
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    throw new Error('Connect Supabase to enable AI Listen (see README setup).')
  }
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) {
    throw new Error('Sign in to use AI Listen.')
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/tts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, style, voice, speed }),
  })

  if (!res.ok) {
    let message = `Listen request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // response wasn't JSON; keep the generic message
    }
    throw new Error(message)
  }

  const transcriptHeader = res.headers.get('X-Transcript')
  const transcript = transcriptHeader ? decodeURIComponent(transcriptHeader) : text
  const blob = await res.blob()
  const audioUrl = URL.createObjectURL(blob)
  return { audioUrl, transcript }
}
