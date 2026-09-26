import { Link } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { BackButton } from '../../components/BackButton'

export function WeakAreas() {
  const { mastery } = useAppStore()
  const weak = Object.values(mastery)
    .filter((m) => m.incorrect > 0)
    .sort((a, b) => b.incorrect - b.correct - (a.incorrect - a.correct))

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <BackButton to="/study" label="Study" />
      <h1 className="text-xl font-bold">Weak-area review</h1>
      {weak.length === 0 ? (
        <div className="rounded-[28px] border border-orange-100 p-6 text-center text-slate-500 dark:border-white/10">
          <p>No weak areas tracked yet. Complete a quiz or flashcard set to build your review list.</p>
          <Link to="/study/quiz" className="mt-3 inline-block text-brand-600 dark:text-brand-400">
            Start a quiz →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {weak.map((w) => (
            <div
              key={w.medicineId}
              className="flex items-center justify-between glass-card p-4"
            >
              <div>
                <p className="font-medium">Medicine ID: {w.medicineId}</p>
                <p className="text-sm text-slate-500">
                  {w.correct} correct · {w.incorrect} incorrect
                </p>
              </div>
              <Link
                to={`/medicines/${w.medicineId}`}
                className="rounded-full border border-orange-100 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
