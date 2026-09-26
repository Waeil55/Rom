import type { Disease } from '../data/diseases'

export interface DiseaseFlashcard {
  id: string
  front: string
  back: string
  diseaseId: string
  diseaseName: string
}

export interface DiseaseQuizQuestion {
  id: string
  prompt: string
  choices: string[]
  correctIndex: number
  diseaseId: string
}

export function buildDiseaseFlashcards(diseases: Disease[]): DiseaseFlashcard[] {
  const cards: DiseaseFlashcard[] = []
  for (const d of diseases) {
    cards.push({
      id: `${d.id}-overview`,
      front: `What is ${d.name}?`,
      back: d.overview,
      diseaseId: d.id,
      diseaseName: d.name,
    })
    cards.push({
      id: `${d.id}-diagnosis`,
      front: `How is ${d.name} diagnosed?`,
      back: d.diagnosis,
      diseaseId: d.id,
      diseaseName: d.name,
    })
    cards.push({
      id: `${d.id}-treatment`,
      front: `How is ${d.name} treated?`,
      back: d.treatment,
      diseaseId: d.id,
      diseaseName: d.name,
    })
    cards.push({
      id: `${d.id}-complications`,
      front: `What complications are associated with ${d.name}?`,
      back: d.complications,
      diseaseId: d.id,
      diseaseName: d.name,
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

export function buildDiseaseQuiz(diseases: Disease[], count = 10): DiseaseQuizQuestion[] {
  if (diseases.length < 4) return []
  const pool = shuffle(diseases)
  const questions: DiseaseQuizQuestion[] = []

  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const d = pool[i]
    const distractors = shuffle(diseases.filter((x) => x.id !== d.id)).slice(0, 3)
    const kind = i % 2

    if (kind === 0) {
      const choices = shuffle([d.system, ...distractors.map((x) => x.system)])
      questions.push({
        id: `${d.id}-system`,
        prompt: `${d.name} primarily affects which body system?`,
        choices,
        correctIndex: choices.indexOf(d.system),
        diseaseId: d.id,
      })
    } else {
      const choices = shuffle([d.name, ...distractors.map((x) => x.name)])
      questions.push({
        id: `${d.id}-name`,
        prompt: `Which condition matches: "${d.overview}"?`,
        choices,
        correctIndex: choices.indexOf(d.name),
        diseaseId: d.id,
      })
    }
  }
  return questions
}
