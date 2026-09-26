import type { Flashcard, Medicine, QuizQuestion } from './types'

export function buildFlashcards(medicines: Medicine[]): Flashcard[] {
  const cards: Flashcard[] = []
  for (const med of medicines) {
    cards.push({
      id: `${med.id}-brand-generic`,
      front: `Brand name: ${med.brandName}`,
      back: `Generic name: ${med.genericName}`,
      medicineId: med.id,
      medicineName: med.brandName,
    })
    cards.push({
      id: `${med.id}-class`,
      front: `What drug class is ${med.genericName} in?`,
      back: med.drugClass,
      medicineId: med.id,
      medicineName: med.brandName,
    })
    cards.push({
      id: `${med.id}-indications`,
      front: `What is ${med.genericName} used for?`,
      back: med.indications,
      medicineId: med.id,
      medicineName: med.brandName,
    })
    cards.push({
      id: `${med.id}-side-effects`,
      front: `Key side effects of ${med.genericName}?`,
      back: med.sideEffects,
      medicineId: med.id,
      medicineName: med.brandName,
    })
  }
  return cards
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function buildQuiz(medicines: Medicine[], count = 10): QuizQuestion[] {
  if (medicines.length < 4) return []
  const questions: QuizQuestion[] = []
  const pool = shuffle(medicines)

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const med = pool[i]
    const distractors = shuffle(medicines.filter((m) => m.id !== med.id)).slice(0, 3)
    const kind = i % 3

    if (kind === 0) {
      const choices = shuffle([med.genericName, ...distractors.map((d) => d.genericName)])
      questions.push({
        id: `${med.id}-bg`,
        type: 'brand-generic',
        prompt: `What is the generic name for ${med.brandName}?`,
        choices,
        correctIndex: choices.indexOf(med.genericName),
        medicineId: med.id,
      })
    } else if (kind === 1) {
      const choices = shuffle([med.drugClass, ...distractors.map((d) => d.drugClass)])
      questions.push({
        id: `${med.id}-class`,
        type: 'multiple-choice',
        prompt: `${med.genericName} belongs to which drug class?`,
        choices,
        correctIndex: choices.indexOf(med.drugClass),
        medicineId: med.id,
      })
    } else {
      const isTrue = Math.random() > 0.5
      const statement = isTrue
        ? `${med.genericName} is classified as ${med.drugClass}.`
        : `${med.genericName} is classified as ${distractors[0].drugClass}.`
      questions.push({
        id: `${med.id}-tf`,
        type: 'true-false',
        prompt: statement,
        choices: ['True', 'False'],
        correctIndex: isTrue ? 0 : 1,
        medicineId: med.id,
      })
    }
  }
  return questions
}
