import { DAY_1_MEDICATIONS, type LocalMedication } from '../data/medications'
import { searchMedicines } from './openfda'
import type { Medicine } from './types'

const NOT_CURATED = 'Not part of the curated Day 1 dataset yet — refer to a full drug reference or the FDA label for this section.'

export function localToMedicine(local: LocalMedication): Medicine {
  return {
    id: `local-${local.id}`,
    brandName: local.brandName,
    genericName: local.genericName,
    drugClass: local.drugClass,
    manufacturer: 'Multiple manufacturers',
    mechanism: NOT_CURATED,
    indications: local.indications,
    dosage: NOT_CURATED,
    contraindications: NOT_CURATED,
    warnings: NOT_CURATED,
    sideEffects: local.sideEffects,
    interactions: NOT_CURATED,
    monitoring: NOT_CURATED,
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

/** Merge a curated local entry's accuracy-critical fields onto a live OpenFDA record, when both exist for the same drug. */
export async function enrichWithOpenFda(local: Medicine): Promise<Medicine> {
  try {
    const generic = local.genericName.split('/')[0]
    const results = await searchMedicines(generic, 1).catch(() => [])
    const fda = results[0] ?? null
    if (!fda) return local
    return {
      ...local,
      mechanism: fda.mechanism !== 'Not documented in the available label data.' ? fda.mechanism : local.mechanism,
      dosage: fda.dosage !== 'Not documented in the available label data.' ? fda.dosage : local.dosage,
      contraindications:
        fda.contraindications !== 'Not documented in the available label data.'
          ? fda.contraindications
          : local.contraindications,
      warnings: fda.warnings !== 'Not documented in the available label data.' ? fda.warnings : local.warnings,
      interactions:
        fda.interactions !== 'Not documented in the available label data.' ? fda.interactions : local.interactions,
      monitoring: fda.monitoring !== 'Not documented in the available label data.' ? fda.monitoring : local.monitoring,
    }
  } catch {
    return local
  }
}
