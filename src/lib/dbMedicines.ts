import { supabase } from './supabase'
import type { Medicine } from './types'
import type { ExtractedMedicineDraft } from './medicineExtraction'

interface MedicineRow {
  id: string
  brand_name: string
  generic_name: string
  pronunciation: string | null
  drug_class: string
  mechanism: string
  indications: string
  dosage: string
  contraindications: string
  warnings: string
  side_effects: string
  interactions: string
  monitoring: string
  counseling: string
  pearls: string
}

function rowToMedicine(row: MedicineRow): Medicine {
  return {
    id: `db-${row.id}`,
    brandName: row.brand_name,
    genericName: row.generic_name,
    pronunciation: row.pronunciation,
    drugClass: row.drug_class,
    manufacturer: 'Community-added',
    mechanism: row.mechanism,
    indications: row.indications,
    dosage: row.dosage,
    contraindications: row.contraindications,
    warnings: row.warnings,
    sideEffects: row.side_effects,
    interactions: row.interactions,
    monitoring: row.monitoring,
    counseling: row.counseling,
    pearls: row.pearls,
  }
}

export function isDbId(id: string): boolean {
  return id.startsWith('db-')
}

export async function fetchDbMedicines(): Promise<Medicine[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('medicines').select('*').order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as MedicineRow[]).map(rowToMedicine)
}

export async function getDbMedicineById(id: string): Promise<Medicine | null> {
  if (!supabase) return null
  const slug = id.replace(/^db-/, '')
  const { data, error } = await supabase.from('medicines').select('*').eq('id', slug).single()
  if (error || !data) return null
  return rowToMedicine(data as MedicineRow)
}

export async function saveDbMedicine(
  draft: ExtractedMedicineDraft,
  source: 'manual' | 'ai-extracted',
  userId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured.' }
  const { error } = await supabase.from('medicines').insert({
    brand_name: draft.brandName,
    generic_name: draft.genericName,
    pronunciation: draft.pronunciation || null,
    drug_class: draft.drugClass,
    mechanism: draft.mechanism,
    indications: draft.indications,
    dosage: draft.dosage,
    contraindications: draft.contraindications,
    warnings: draft.warnings,
    side_effects: draft.sideEffects,
    interactions: draft.interactions,
    monitoring: draft.monitoring,
    counseling: draft.counseling,
    pearls: draft.pearls,
    source,
    created_by: userId,
  })
  return { error: error?.message ?? null }
}

export async function deleteDbMedicine(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured.' }
  const slug = id.replace(/^db-/, '')
  const { error } = await supabase.from('medicines').delete().eq('id', slug)
  return { error: error?.message ?? null }
}
