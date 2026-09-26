import { MEDICINE_LIBRARY, type LibraryMedicine } from '../data/medicineLibrary'
import { DAY_1_MEDICATIONS } from '../data/medications'
import type { Medicine } from './types'

const DAY1_GENERICS = new Set(DAY_1_MEDICATIONS.map((m) => m.genericName.toLowerCase()))

/** The 175-drug library, minus anything already covered in the curated Day 1 set, to avoid duplicates. */
function nonOverlapping(): LibraryMedicine[] {
  return MEDICINE_LIBRARY.filter((m) => !DAY1_GENERICS.has(m.genericName.toLowerCase()))
}

function joinList(list?: string[], fallback = 'Not specified in source material.'): string {
  return list && list.length > 0 ? list.join('; ') : fallback
}

export function libraryToMedicine(lib: LibraryMedicine): Medicine {
  const sideEffectParts = [
    lib.sideEffects?.common?.length ? `Common: ${lib.sideEffects.common.join(', ')}.` : '',
    lib.sideEffects?.serious?.length ? `Serious: ${lib.sideEffects.serious.join(', ')}.` : '',
    lib.sideEffects?.rare?.length ? `Rare: ${lib.sideEffects.rare.join(', ')}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const dosingParts = [
    lib.dosing?.adult ? `Adult: ${lib.dosing.adult}.` : '',
    lib.dosing?.pediatric ? `Pediatric: ${lib.dosing.pediatric}.` : '',
    lib.dosing?.renal ? `Renal impairment: ${lib.dosing.renal}.` : '',
    lib.dosing?.hepatic ? `Hepatic impairment: ${lib.dosing.hepatic}.` : '',
    lib.dosing?.maxDose ? `Max dose: ${lib.dosing.maxDose}.` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    id: `lib-${lib.id}`,
    brandName: lib.brandNames?.[0] ?? lib.name,
    genericName: lib.genericName,
    pronunciation: null,
    drugClass: lib.drugClass,
    manufacturer: 'Multiple manufacturers',
    mechanism: lib.mechanism || 'Not specified in source material.',
    indications: joinList(lib.indications),
    dosage: dosingParts || 'Not specified in source material.',
    contraindications: joinList(lib.contraindications),
    warnings: lib.blackBoxWarning ? `Boxed warning: ${lib.blackBoxWarning}` : 'Not specified in source material.',
    sideEffects: sideEffectParts || 'Not specified in source material.',
    interactions: joinList(lib.interactions),
    monitoring: joinList(lib.monitoring),
    counseling: joinList(lib.counseling, 'No specific counseling points recorded.'),
    pearls: joinList(lib.keyFacts, `${lib.genericName} is classified as ${lib.drugClass}.`),
  }
}

export function isLibraryId(id: string): boolean {
  return id.startsWith('lib-')
}

export function getAllLibraryMedicines(): Medicine[] {
  return nonOverlapping().map(libraryToMedicine)
}

export function searchLibraryMedicines(query: string): Medicine[] {
  const term = query.trim().toLowerCase()
  const pool = nonOverlapping()
  const filtered = term
    ? pool.filter(
        (m) =>
          m.genericName.toLowerCase().includes(term) ||
          m.name.toLowerCase().includes(term) ||
          m.brandNames?.some((b) => b.toLowerCase().includes(term)) ||
          m.drugClass.toLowerCase().includes(term)
      )
    : pool
  return filtered.map(libraryToMedicine)
}

export function getLibraryMedicineById(id: string): Medicine | null {
  const slug = id.replace(/^lib-/, '')
  const found = MEDICINE_LIBRARY.find((m) => m.id === slug)
  return found ? libraryToMedicine(found) : null
}

/** The raw, richly-structured record (for showing black box warnings, mnemonics, etc. on the detail page). */
export function getRawLibraryMedicine(id: string): LibraryMedicine | null {
  const slug = id.replace(/^lib-/, '')
  return MEDICINE_LIBRARY.find((m) => m.id === slug) ?? null
}
