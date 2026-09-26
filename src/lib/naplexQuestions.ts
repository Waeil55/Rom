import { NAPLEX_QUESTIONS, type NaplexQuestion } from '../data/naplexQuestions'

export function getAllNaplexQuestions(): NaplexQuestion[] {
  return NAPLEX_QUESTIONS
}

export function getNaplexCategories(): string[] {
  return Array.from(new Set(NAPLEX_QUESTIONS.map((q) => q.category))).sort()
}

export function getNaplexQuestionsByCategory(category: string): NaplexQuestion[] {
  return NAPLEX_QUESTIONS.filter((q) => q.category === category)
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildNaplexQuizSet(category: string | 'All', count = 20): NaplexQuestion[] {
  const pool = category === 'All' ? NAPLEX_QUESTIONS : getNaplexQuestionsByCategory(category)
  return shuffle(pool).slice(0, count)
}
