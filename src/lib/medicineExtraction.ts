import { supabase } from './supabase'
import type { FileExtractionResult } from './fileExtraction'

export interface ExtractedMedicineDraft {
  brandName: string
  genericName: string
  pronunciation: string
  drugClass: string
  mechanism: string
  indications: string
  dosage: string
  contraindications: string
  warnings: string
  sideEffects: string
  interactions: string
  monitoring: string
  counseling: string
  pearls: string
}

export async function extractMedicineFromFile(input: FileExtractionResult): Promise<ExtractedMedicineDraft> {
  if (!supabase) throw new Error('Connect Supabase to enable AI extraction.')

  const { data, error } = await supabase.functions.invoke('extract-medicine', {
    body:
      input.mode === 'image'
        ? { mode: 'image', imageBase64: input.imageBase64, mimeType: input.mimeType }
        : { mode: 'text', content: input.content },
  })

  if (error) {
    const context = (error as { context?: Response }).context
    let message = error.message
    try {
      const body = await context?.clone().json()
      if (body?.error) message = body.error
    } catch {
      // fall back to the generic error message
    }
    throw new Error(message)
  }
  if (!data?.medicine) throw new Error('No extraction returned.')
  return data.medicine as ExtractedMedicineDraft
}
