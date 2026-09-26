import { useMemo, useState } from 'react'
import { getAllDiseases } from '../../lib/diseases'
import { buildDiseaseFlashcards } from '../../lib/diseaseStudyGenerators'
import { ListenButton } from '../../components/ListenButton'
import { BackButton } from '../../components/BackButton'

export function DiseaseFlashcards() {
  const cards = useMemo(() => buildDiseaseFlashcards(getAllDiseases()), [])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (cards.length === 0)
    return (
      <div className="space-y-4">
        <BackButton to="/diseases" label="Diseases" />
        <p className="text-slate-400">No flashcards available yet.</p>
      </div>
    )

  const card = cards[index]

  function next() {
    setFlipped(false)
    setIndex((i) => (i + 1) % cards.length)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <BackButton to="/diseases" label="Diseases" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Disease Flashcards</h1>
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
        <ListenButton label={card.diseaseName} text={flipped ? card.back : card.front} size="md" />
      </div>

      <button
        onClick={() => (flipped ? next() : setFlipped(true))}
        className="w-full rounded-[28px] bg-gradient-to-r from-brand-400 to-brand-700 py-3 font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
      >
        {flipped ? 'Next card' : 'Flip card'}
      </button>
    </div>
  )
}
