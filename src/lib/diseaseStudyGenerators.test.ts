import { describe, it, expect } from 'vitest'
import { buildDiseaseFlashcards, buildDiseaseQuiz } from './diseaseStudyGenerators'
import type { Disease } from '../data/diseases'

function makeDisease(overrides: Partial<Disease> = {}): Disease {
  return {
    id: 'd1',
    name: 'Test Disease',
    aliases: [],
    system: 'Test System',
    icd10: 'T00',
    overview: 'Test overview',
    pathophysiology: 'Test pathophysiology',
    diagnosis: 'Test diagnosis',
    treatment: 'Test treatment',
    complications: 'Test complications',
    tags: ['test'],
    ...overrides,
  }
}

describe('buildDiseaseFlashcards', () => {
  it('produces 4 cards per disease', () => {
    const diseases = [makeDisease({ id: 'a' }), makeDisease({ id: 'b' })]
    expect(buildDiseaseFlashcards(diseases)).toHaveLength(8)
  })

  it('returns an empty array for an empty pool', () => {
    expect(buildDiseaseFlashcards([])).toEqual([])
  })
})

describe('buildDiseaseQuiz', () => {
  it('returns no questions with fewer than 4 diseases', () => {
    const diseases = [makeDisease({ id: 'a' }), makeDisease({ id: 'b' })]
    expect(buildDiseaseQuiz(diseases, 10)).toEqual([])
  })

  it('generates valid questions with a correct answer within range', () => {
    const diseases = Array.from({ length: 8 }, (_, i) =>
      makeDisease({ id: `d${i}`, name: `Disease${i}`, system: `System${i}`, overview: `Overview${i}` })
    )
    const questions = buildDiseaseQuiz(diseases, 8)
    expect(questions.length).toBeGreaterThan(0)
    for (const q of questions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.choices.length)
      expect(new Set(q.choices).size).toBe(q.choices.length)
    }
  })
})
