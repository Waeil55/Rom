import { describe, it, expect } from 'vitest'
import { buildFlashcards, buildQuiz } from './studyGenerators'
import type { Medicine } from './types'

function makeMedicine(overrides: Partial<Medicine> = {}): Medicine {
  return {
    id: 'm1',
    brandName: 'Brandex',
    genericName: 'genericum',
    pronunciation: null,
    drugClass: 'Test class',
    manufacturer: 'Test Co',
    mechanism: 'Test mechanism',
    indications: 'Test indications',
    dosage: 'Test dosage',
    contraindications: 'Test contraindications',
    warnings: 'Test warnings',
    sideEffects: 'Test side effects',
    interactions: 'Test interactions',
    monitoring: 'Test monitoring',
    counseling: 'Test counseling',
    pearls: 'Test pearls',
    ...overrides,
  }
}

describe('buildFlashcards', () => {
  it('produces 4 cards per medicine', () => {
    const meds = [makeMedicine({ id: 'a' }), makeMedicine({ id: 'b' })]
    const cards = buildFlashcards(meds)
    expect(cards).toHaveLength(8)
  })

  it('every card references its source medicine id', () => {
    const meds = [makeMedicine({ id: 'a', brandName: 'Alpha' })]
    const cards = buildFlashcards(meds)
    expect(cards.every((c) => c.medicineId === 'a')).toBe(true)
    expect(cards.every((c) => c.medicineName === 'Alpha')).toBe(true)
  })

  it('returns an empty array for an empty pool', () => {
    expect(buildFlashcards([])).toEqual([])
  })
})

describe('buildQuiz', () => {
  it('returns no questions when the pool has fewer than 4 medicines', () => {
    const meds = [makeMedicine({ id: 'a' }), makeMedicine({ id: 'b' })]
    expect(buildQuiz(meds, 10)).toEqual([])
  })

  it('caps question count at the requested count and pool size', () => {
    const meds = Array.from({ length: 6 }, (_, i) => makeMedicine({ id: `m${i}`, genericName: `generic${i}` }))
    const questions = buildQuiz(meds, 3)
    expect(questions).toHaveLength(3)
  })

  it('every question has exactly one correct choice and 4 total choices for mc/brand-generic', () => {
    const meds = Array.from({ length: 8 }, (_, i) =>
      makeMedicine({ id: `m${i}`, genericName: `generic${i}`, brandName: `Brand${i}`, drugClass: `Class${i}` })
    )
    const questions = buildQuiz(meds, 8)
    for (const q of questions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0)
      expect(q.correctIndex).toBeLessThan(q.choices.length)
      if (q.type !== 'true-false') {
        expect(q.choices).toHaveLength(4)
      } else {
        expect(q.choices).toEqual(['True', 'False'])
      }
    }
  })

  it('never generates duplicate choices within a single question', () => {
    const meds = Array.from({ length: 10 }, (_, i) =>
      makeMedicine({ id: `m${i}`, genericName: `generic${i}`, drugClass: `Class${i}` })
    )
    const questions = buildQuiz(meds, 10)
    for (const q of questions) {
      expect(new Set(q.choices).size).toBe(q.choices.length)
    }
  })
})
