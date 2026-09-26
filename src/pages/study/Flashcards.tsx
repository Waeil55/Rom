import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStudyPool } from '../../hooks/useStudyPool'
import { buildFlashcards } from '../../lib/studyGenerators'
import { useAppStore } from '../../store/useAppStore'
import { ListenButton } from '../../components/ListenButton'

export function Flashcards() {
  const [params] = useSearchParams()
  const medicineId = params.get('medicineId')
  const { medicines, loading } = useStudyPool(medicineId)
  const cards = useMemo(() => buildFlashcards(medicines), [medicines])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const { recordAnswer } = useAppStore()

  if (loading) return <p className="text-slate-400">Loading flashcards…</p>
  if (cards.length === 0) return <p className="text-slate-400">No flashcards available yet.</p>

  const card = cards[index]

  function answer(known: boolean) {
    recordAnswer(card.medicineId, known)
    setFlipped(false)
    setIndex((i) => (i + 1) % cards.length)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Flashcards</h1>
        <span className="text-sm text-slate-400">
          {index + 1} / {cards.length}
        </span>
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[220px] w-full items-center justify-center rounded-[28px] border border-orange-100 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
      </button>

      <div className="flex items-center justify-center gap-3">
        <ListenButton label={card.medicineName} text={flipped ? card.back : card.front} size="md" />
      </div>

      {flipped ? (
        <div className="flex gap-3">
          <button
            onClick={() => answer(false)}
            className="flex-1 rounded-[28px] border border-red-200 py-3 font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
          >
            Didn't know it
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 rounded-[28px] border border-green-200 py-3 font-semibold text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-900/20"
          >
            Knew it
          </button>
        </div>
      ) : (
        <button
          onClick={() => setFlipped(true)}
          className="w-full rounded-[28px] bg-gradient-to-r from-brand-400 to-brand-700 py-3 font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Flip card
        </button>
      )}
    </div>
  )
}
