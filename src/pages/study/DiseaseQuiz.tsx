import { useMemo, useState } from 'react'
import { getAllDiseases } from '../../lib/diseases'
import { buildDiseaseQuiz } from '../../lib/diseaseStudyGenerators'
import { BackButton } from '../../components/BackButton'

export function DiseaseQuiz() {
  const questions = useMemo(() => buildDiseaseQuiz(getAllDiseases(), 10), [])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  if (questions.length === 0)
    return (
      <div className="space-y-4">
        <BackButton to="/diseases" label="Diseases" />
        <p className="text-slate-400">Not enough disease data loaded to build a quiz.</p>
      </div>
    )

  if (finished) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <BackButton to="/diseases" label="Diseases" className="mx-auto" />
        <h1 className="text-2xl font-bold">Quiz complete</h1>
        <p className="text-lg">
          Score: <span className="font-semibold text-brand-600">{score}</span> / {questions.length}
        </p>
        <button
          onClick={() => {
            setIndex(0)
            setScore(0)
            setSelected(null)
            setFinished(false)
          }}
          className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Try again
        </button>
      </div>
    )
  }

  const q = questions[index]

  function choose(i: number) {
    if (selected !== null) return
    setSelected(i)
    if (i === q.correctIndex) setScore((s) => s + 1)
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1)
      setSelected(null)
    } else {
      setFinished(true)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <BackButton to="/diseases" label="Diseases" />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Disease Quiz</h1>
        <span className="text-sm text-slate-400">
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-[28px] border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <p className="mb-4 text-lg font-medium">{q.prompt}</p>
        <div className="space-y-2">
          {q.choices.map((choice, i) => {
            const isCorrect = i === q.correctIndex
            const isSelected = i === selected
            let style = 'border-orange-100 dark:border-slate-700'
            if (selected !== null) {
              if (isCorrect) style = 'border-green-400 bg-green-50 dark:bg-green-900/20'
              else if (isSelected) style = 'border-red-400 bg-red-50 dark:bg-red-900/20'
            }
            return (
              <button
                key={choice}
                onClick={() => choose(i)}
                className={`w-full rounded-[28px] border px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
              >
                {choice}
              </button>
            )
          })}
        </div>
      </div>

      {selected !== null && (
        <button
          onClick={next}
          className="w-full rounded-[28px] bg-gradient-to-r from-brand-400 to-brand-700 py-3 font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          {index + 1 < questions.length ? 'Next question' : 'See results'}
        </button>
      )}
    </div>
  )
}
