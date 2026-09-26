import type { Medicine } from './types'

const BASE = 'https://api.fda.gov/drug/label.json'

interface OpenFdaResult {
  id: string
  openfda?: {
    brand_name?: string[]
    generic_name?: string[]
    manufacturer_name?: string[]
    pharm_class_epc?: string[]
    pharm_class_moa?: string[]
  }
  clinical_pharmacology?: string[]
  mechanism_of_action?: string[]
  indications_and_usage?: string[]
  dosage_and_administration?: string[]
  contraindications?: string[]
  warnings?: string[]
  warnings_and_cautions?: string[]
  adverse_reactions?: string[]
  drug_interactions?: string[]
  patient_medication_information?: string[]
  information_for_patients?: string[]
  clinical_pharmacology_table?: string[]
}

function firstSentences(value: string | undefined, count = 3): string {
  if (!value) return 'Not documented in the available label data.'
  const clean = value.replace(/\s+/g, ' ').trim()
  const sentences = clean.split(/(?<=[.!?])\s+/).slice(0, count)
  return sentences.join(' ')
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ')
}

function normalize(result: OpenFdaResult): Medicine {
  const brand = result.openfda?.brand_name?.[0] ?? 'Unknown Brand'
  const generic = result.openfda?.generic_name?.[0] ?? brand
  return {
    id: result.id,
    brandName: titleCase(brand),
    genericName: titleCase(generic),
    drugClass: result.openfda?.pharm_class_epc?.[0]?.replace(/\[.*?\]/g, '').trim() ?? 'Uncategorized',
    manufacturer: result.openfda?.manufacturer_name?.[0] ?? 'Unknown manufacturer',
    mechanism: firstSentences(result.mechanism_of_action?.[0] ?? result.clinical_pharmacology?.[0], 4),
    indications: firstSentences(result.indications_and_usage?.[0], 5),
    dosage: firstSentences(result.dosage_and_administration?.[0], 4),
    contraindications: firstSentences(result.contraindications?.[0], 4),
    warnings: firstSentences(result.warnings?.[0] ?? result.warnings_and_cautions?.[0], 5),
    sideEffects: firstSentences(result.adverse_reactions?.[0], 5),
    interactions: firstSentences(result.drug_interactions?.[0], 4),
    monitoring: firstSentences(result.warnings_and_cautions?.[0], 3),
    counseling: firstSentences(result.information_for_patients?.[0] ?? result.patient_medication_information?.[0], 4),
    pearls: `${titleCase(generic)} belongs to the ${result.openfda?.pharm_class_epc?.[0]?.replace(/\[.*?\]/g, '').trim() ?? 'therapeutic'} class. Always confirm current label data before clinical use.`,
  }
}

export async function searchMedicines(query: string, limit = 20): Promise<Medicine[]> {
  const term = query.trim()
  const search = term
    ? `(openfda.brand_name:"${term}"*+OR+openfda.generic_name:"${term}"*)`
    : 'openfda.generic_name:*'
  const res = await fetch(`${BASE}?search=${search}&limit=${limit}`)
  if (!res.ok) {
    if (res.status === 404) return []
    throw new Error(`OpenFDA request failed: ${res.status}`)
  }
  const data = await res.json()
  const results: OpenFdaResult[] = data.results ?? []
  const seen = new Set<string>()
  const meds: Medicine[] = []
  for (const r of results) {
    const med = normalize(r)
    const key = med.genericName.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    meds.push(med)
  }
  return meds
}

export async function getMedicineById(id: string): Promise<Medicine | null> {
  const res = await fetch(`${BASE}?search=id:"${id}"&limit=1`)
  if (!res.ok) return null
  const data = await res.json()
  const result: OpenFdaResult | undefined = data.results?.[0]
  return result ? normalize(result) : null
}

export const FEATURED_QUERIES = [
  { label: 'Cardiovascular', query: 'atorvastatin' },
  { label: 'Antibiotics', query: 'amoxicillin' },
  { label: 'Pain & Inflammation', query: 'ibuprofen' },
  { label: 'Mental Health', query: 'sertraline' },
  { label: 'Diabetes', query: 'metformin' },
  { label: 'Respiratory', query: 'albuterol' },
]
