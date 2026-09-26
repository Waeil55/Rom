import { useMemo, useState } from 'react'
import { getNaplexCategories, buildNaplexQuizSet } from '../../lib/naplexQuestions'
import { BackButton } from '../../components/BackButton'

export function NaplexQuizBank() {
  const categories = useMemo(() => ['All', ...getNaplexCategories()], [])
  const [category, setCategory] = useState('All')
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<ReturnType<typeof buildNaplexQuizSet>>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  function start() {
    setQuestions(buildNaplexQuizSet(category, 20))
    setIndex(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
    setStarted(true)
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <BackButton to="/naplex" label="NAPLEX" />
        <div>
          <h1 className="text-2xl font-black tracking-tight">NAPLEX Question Bank</h1>
          <p className="text-slate-500">Original practice questions with full explanations. Pick a category to begin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                category === c
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  : 'border-orange-100 dark:border-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <button
          onClick={start}
          className="w-full rounded-full bg-gradient-to-r from-brand-400 to-brand-700 py-3 font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Start quiz
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <BackButton to="/naplex" label="NAPLEX" />
        <p className="text-slate-400">No questions available for this category yet.</p>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <BackButton to="/naplex" label="NAPLEX" className="mx-auto" />
        <h1 className="text-2xl font-bold">Quiz complete</h1>
        <p className="text-lg">
          Score: <span className="font-semibold text-brand-600">{score}</span> / {questions.length}
        </p>
        <button
          onClick={() => setStarted(false)}
          className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Choose another category
        </button>
      </div>
    )
  }

  const q = questions[index]

  function choose(option: string) {
    if (selected !== null) return
    setSelected(option)
    if (option === q.correctAnswer) setScore((s) => s + 1)
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
      <BackButton to="/naplex" label="NAPLEX" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">NAPLEX Question Bank</h1>
          <p className="text-xs text-slate-400">{q.category}</p>
        </div>
        <span className="text-sm text-slate-400">
          {index + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-[28px] border border-orange-100 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <p className="mb-4 text-lg font-medium">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((option) => {
            const isCorrect = option === q.correctAnswer
            const isSelected = option === selected
            let style = 'border-orange-100 dark:border-slate-700'
            if (selected !== null) {
              if (isCorrect) style = 'border-green-400 bg-green-50 dark:bg-green-900/20'
              else if (isSelected) style = 'border-red-400 bg-red-50 dark:bg-red-900/20'
            }
            return (
              <button
                key={option}
                onClick={() => choose(option)}
                className={`w-full rounded-[28px] border px-4 py-3 text-left text-sm font-medium transition-colors ${style}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 rounded-2xl bg-brand-50 p-3 text-sm text-slate-700 dark:bg-brand-900/20 dark:text-slate-300">
            <span className="font-semibold text-brand-700 dark:text-brand-400">Explanation: </span>
            {q.explanation}
          </div>
        )}
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
