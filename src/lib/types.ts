export interface Medicine {
  id: string
  brandName: string
  genericName: string
  pronunciation: string | null
  drugClass: string
  manufacturer: string
  mechanism: string
  indications: string
  dosage: string
  contraindications: string
  warnings: string
  sideEffects: string
  interactions: string
  monitoring: string
  counseling: string
  pearls: string
}

export interface MedicineSection {
  key: keyof Pick<
    Medicine,
    | 'mechanism'
    | 'indications'
    | 'dosage'
    | 'contraindications'
    | 'warnings'
    | 'sideEffects'
    | 'interactions'
    | 'monitoring'
    | 'counseling'
    | 'pearls'
  >
  label: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  medicineId: string
  medicineName: string
}

export type QuizType = 'multiple-choice' | 'true-false' | 'matching' | 'fill-blank' | 'brand-generic'

export interface QuizQuestion {
  id: string
  type: QuizType
  prompt: string
  choices: string[]
  correctIndex: number
  medicineId: string
}

export type TeachingStyle =
  | 'read-exactly'
  | 'explain-simply'
  | 'teach-professor'
  | 'exam-review'
  | 'clinical-explanation'
  | 'quick-review'

export interface ListenRequest {
  text: string
  style: TeachingStyle
  speed: number
}

export interface Profile {
  id: string
  email: string
  displayName: string
  role: 'student' | 'admin'
  dailyGoalMinutes: number
  createdAt: string
}

export interface StudyProgress {
  userId: string
  medicineId: string
  section: string
  masteryScore: number
  lastReviewed: string
}
