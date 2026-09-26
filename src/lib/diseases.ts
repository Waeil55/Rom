import { DISEASES, type Disease } from '../data/diseases'

export function getAllDiseases(): Disease[] {
  return DISEASES
}

export function searchDiseases(query: string): Disease[] {
  const term = query.trim().toLowerCase()
  if (!term) return DISEASES
  return DISEASES.filter(
    (d) =>
      d.name.toLowerCase().includes(term) ||
      d.aliases.some((a) => a.toLowerCase().includes(term)) ||
      d.system.toLowerCase().includes(term) ||
      d.tags.some((t) => t.toLowerCase().includes(term))
  )
}

export function getDiseaseById(id: string): Disease | null {
  return DISEASES.find((d) => d.id === id) ?? null
}

export function getAllSystems(): string[] {
  return Array.from(new Set(DISEASES.map((d) => d.system))).sort()
}

export function getAllTags(): string[] {
  return Array.from(new Set(DISEASES.flatMap((d) => d.tags))).sort()
}

export function getDiseasesBySystem(system: string): Disease[] {
  return DISEASES.filter((d) => d.system === system)
}

export function getDiseasesByTag(tag: string): Disease[] {
  return DISEASES.filter((d) => d.tags.includes(tag))
}

/** The complete narration script for a disease — every field, read fully, for the "Listen to everything" button. */
export function getFullDiseaseScript(d: Disease): string {
  return [
    `${d.name}.`,
    d.aliases.length ? `Also known as ${d.aliases.join(', ')}.` : '',
    `Body system: ${d.system}.`,
    `Overview: ${d.overview}.`,
    `Pathophysiology: ${d.pathophysiology}.`,
    `Diagnosis: ${d.diagnosis}.`,
    `Treatment: ${d.treatment}.`,
    `Complications: ${d.complications}.`,
  ]
    .filter(Boolean)
    .join(' ')
}
