import { DAY_1_MEDICATIONS, type LocalMedication } from '../data/medications'
import { CLINICAL_DETAILS } from '../data/clinicalDetails'
import { PRONUNCIATIONS } from '../data/pronunciations'
import { searchMedicines } from './openfda'
import type { Medicine } from './types'

const NOT_CURATED = 'Not part of the curated Day 1 dataset yet — refer to a full drug reference or the FDA label for this section.'

export function localToMedicine(local: LocalMedication): Medicine {
  const clinical = CLINICAL_DETAILS[local.id]
  return {
    id: `local-${local.id}`,
    brandName: local.brandName,
    genericName: local.genericName,
    pronunciation: PRONUNCIATIONS[local.id] ?? null,
    drugClass: local.drugClass,
    manufacturer: 'Multiple manufacturers',
    mechanism: clinical?.mechanism ?? NOT_CURATED,
    indications: local.indications,
    dosage: clinical?.dosage ?? NOT_CURATED,
    contraindications: clinical?.contraindications ?? NOT_CURATED,
    warnings: clinical?.warnings ?? NOT_CURATED,
    sideEffects: local.sideEffects,
    interactions: clinical?.interactions ?? NOT_CURATED,
    monitoring: clinical?.monitoring ?? NOT_CURATED,
    counseling: local.counseling.join(' '),
    pearls: `${local.genericName} (${local.brandName}) is classified as ${local.drugClass}.`,
  }
}

export function isLocalId(id: string): boolean {
  return id.startsWith('local-')
}

export function getAllLocalMedicines(): Medicine[] {
  return DAY_1_MEDICATIONS.map(localToMedicine)
}

export function searchLocalMedicines(query: string): Medicine[] {
  const term = query.trim().toLowerCase()
  const pool = term
    ? DAY_1_MEDICATIONS.filter(
        (m) =>
          m.genericName.toLowerCase().includes(term) ||
          m.brandName.toLowerCase().includes(term) ||
          m.drugClass.toLowerCase().includes(term)
      )
    : DAY_1_MEDICATIONS
  return pool.map(localToMedicine)
}

export function getLocalMedicineById(id: string): Medicine | null {
  const slug = id.replace(/^local-/, '')
  const found = DAY_1_MEDICATIONS.find((m) => m.id === slug)
  return found ? localToMedicine(found) : null
}

/** Other curated medications sharing the same drug class, for a "related medicines" section. */
export function getRelatedLocalMedicines(medicine: Medicine, limit = 6): Medicine[] {
  const slug = medicine.id.replace(/^local-/, '')
  return DAY_1_MEDICATIONS.filter((m) => m.id !== slug && m.drugClass === medicine.drugClass)
    .slice(0, limit)
    .map(localToMedicine)
}

/**
 * Fills any field still marked NOT_CURATED with live OpenFDA label text, as a fallback only.
 * Curated content (from clinicalDetails.ts) always wins when present — this never overwrites it.
 */
export async function enrichWithOpenFda(local: Medicine): Promise<Medicine> {
  const stillMissing = (v: string) => v === NOT_CURATED
  const hasGap =
    stillMissing(local.mechanism) ||
    stillMissing(local.dosage) ||
    stillMissing(local.contraindications) ||
    stillMissing(local.warnings) ||
    stillMissing(local.interactions) ||
    stillMissing(local.monitoring)
  if (!hasGap) return local

  try {
    const generic = local.genericName.split('/')[0]
    const results = await searchMedicines(generic, 1).catch(() => [])
    const fda = results[0] ?? null
    if (!fda) return local
    const fromFda = (local: string, fda: string) =>
      stillMissing(local) && fda !== 'Not documented in the available label data.' ? fda : local
    return {
      ...local,
      mechanism: fromFda(local.mechanism, fda.mechanism),
      dosage: fromFda(local.dosage, fda.dosage),
      contraindications: fromFda(local.contraindications, fda.contraindications),
      warnings: fromFda(local.warnings, fda.warnings),
      interactions: fromFda(local.interactions, fda.interactions),
      monitoring: fromFda(local.monitoring, fda.monitoring),
    }
  } catch {
    return local
  }
}
