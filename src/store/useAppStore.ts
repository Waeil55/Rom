import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TeachingStyle } from '../lib/types'

export type Theme = 'light' | 'dark' | 'system'
export type TextSize = 'sm' | 'md' | 'lg' | 'xl'

interface RecentView {
  medicineId: string
  brandName: string
  genericName: string
  viewedAt: number
}

interface MasteryEntry {
  medicineId: string
  correct: number
  incorrect: number
}

interface AppState {
  theme: Theme
  textSize: TextSize
  reducedMotion: boolean
  audioSpeed: number
  teachingStyle: TeachingStyle
  dailyGoalMinutes: number
  minutesStudiedToday: number
  recentlyViewed: RecentView[]
  bookmarks: string[]
  mastery: Record<string, MasteryEntry>
  setTheme: (t: Theme) => void
  setTextSize: (s: TextSize) => void
  setReducedMotion: (v: boolean) => void
  setAudioSpeed: (v: number) => void
  setTeachingStyle: (v: TeachingStyle) => void
  addRecentlyViewed: (m: Omit<RecentView, 'viewedAt'>) => void
  toggleBookmark: (medicineId: string) => void
  recordAnswer: (medicineId: string, correct: boolean) => void
  addStudyMinutes: (minutes: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      textSize: 'md',
      reducedMotion: false,
      audioSpeed: 1,
      teachingStyle: 'explain-simply',
      dailyGoalMinutes: 20,
      minutesStudiedToday: 0,
      recentlyViewed: [],
      bookmarks: [],
      mastery: {},
      setTheme: (theme) => set({ theme }),
      setTextSize: (textSize) => set({ textSize }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setAudioSpeed: (audioSpeed) => set({ audioSpeed }),
      setTeachingStyle: (teachingStyle) => set({ teachingStyle }),
      addRecentlyViewed: (m) => {
        const filtered = get().recentlyViewed.filter((r) => r.medicineId !== m.medicineId)
        set({ recentlyViewed: [{ ...m, viewedAt: Date.now() }, ...filtered].slice(0, 12) })
      },
      toggleBookmark: (medicineId) => {
        const current = get().bookmarks
        set({
          bookmarks: current.includes(medicineId)
            ? current.filter((id) => id !== medicineId)
            : [...current, medicineId],
        })
      },
      recordAnswer: (medicineId, correct) => {
        const mastery = { ...get().mastery }
        const entry = mastery[medicineId] ?? { medicineId, correct: 0, incorrect: 0 }
        mastery[medicineId] = correct
          ? { ...entry, correct: entry.correct + 1 }
          : { ...entry, incorrect: entry.incorrect + 1 }
        set({ mastery })
      },
      addStudyMinutes: (minutes) => set({ minutesStudiedToday: get().minutesStudiedToday + minutes }),
    }),
    { name: 'pharmalearn-store' }
  )
)
