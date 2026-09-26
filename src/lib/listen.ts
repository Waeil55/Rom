import { supabase } from './supabase'
import type { TeachingStyle } from './types'

export interface ListenResult {
  audioUrl: string
  transcript: string
}

export async function generateSpeech(text: string, style: TeachingStyle): Promise<ListenResult> {
  if (!supabase) {
    throw new Error('Connect Supabase to enable AI Listen (see README setup).')
  }
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) {
    throw new Error('Sign in to use AI Listen.')
  }

  const { data, error } = await supabase.functions.invoke('tts', {
    body: { text, style },
  })

  if (error) throw new Error(error.message)
  if (!data?.audioBase64) throw new Error('No audio returned from server.')

  const binary = atob(data.audioBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: `audio/${data.format ?? 'mp3'}` })
  const audioUrl = URL.createObjectURL(blob)
  return { audioUrl, transcript: data.transcript ?? text }
}
