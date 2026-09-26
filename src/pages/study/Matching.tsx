import { useEffect, useMemo, useState } from 'react'
import { useStudyPool } from '../../hooks/useStudyPool'
import { BackButton } from '../../components/BackButton'

function shuffle<T>(arr: T[]): T[] {
  const c = [...arr]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

export function Matching() {
  const { medicines, loading } = useStudyPool()
  const pairs = useMemo(() => medicines.slice(0, 6), [medicines])
  const brands = useMemo(() => shuffle(pairs.map((p) => ({ id: p.id, value: p.brandName }))), [pairs])
  const generics = useMemo(() => shuffle(pairs.map((p) => ({ id: p.id, value: p.genericName }))), [pairs])

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongFlash, setWrongFlash] = useState<string | null>(null)

  useEffect(() => {
    setMatched(new Set())
    setSelectedBrand(null)
  }, [pairs])

  if (loading)
    return (
      <div className="space-y-4">
        <BackButton to="/study" label="Study" />
        <p className="text-slate-400">Loading…</p>
      </div>
    )
  if (pairs.length === 0)
    return (
      <div className="space-y-4">
        <BackButton to="/study" label="Study" />
        <p className="text-slate-400">Not enough data to build a matching set.</p>
      </div>
    )

  function tryMatch(genericId: string) {
    if (!selectedBrand) return
    if (selectedBrand === genericId) {
      setMatched((m) => new Set(m).add(genericId))
      setSelectedBrand(null)
    } else {
      setWrongFlash(genericId)
      setTimeout(() => setWrongFlash(null), 400)
      setSelectedBrand(null)
    }
  }

  const done = matched.size === pairs.length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton to="/study" label="Study" />
      <h1 className="text-xl font-bold">Matching: Brand ↔ Generic</h1>
      {done ? (
        <p className="rounded-[28px] bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          All matched! Great work.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {brands.map((b) => (
              <button
                key={b.id}
                disabled={matched.has(b.id)}
                onClick={() => setSelectedBrand(b.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium ${
                  matched.has(b.id)
                    ? 'border-green-300 bg-green-50 text-green-600 dark:bg-green-900/20'
                    : selectedBrand === b.id
                      ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-orange-100 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900'
                }`}
              >
                {b.value}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {generics.map((g) => (
              <button
                key={g.id}
                disabled={matched.has(g.id)}
                onClick={() => tryMatch(g.id)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium ${
                  matched.has(g.id)
                    ? 'border-green-300 bg-green-50 text-green-600 dark:bg-green-900/20'
                    : wrongFlash === g.id
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                      : 'border-orange-100 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900'
                }`}
              >
                {g.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
