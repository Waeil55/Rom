import { SYMPTOMS, type Symptom } from '../data/symptoms'

export function getAllSymptoms(): Symptom[] {
  return SYMPTOMS
}

export function getSymptomFullScript(s: Symptom): string {
  return [
    `${s.symptom}.`,
    s.aliases.length ? `Also known as ${s.aliases.join(', ')}.` : '',
    `Clinical importance: ${s.clinicalImportance}.`,
    s.redFlags.length ? `Red flags: ${s.redFlags.join('; ')}.` : '',
    `Characterization: ${s.characterization}.`,
    `Differentials: ${s.differentials}.`,
    `Diagnostic approach: ${s.diagnosticApproach}.`,
  ]
    .filter(Boolean)
    .join(' ')
}
