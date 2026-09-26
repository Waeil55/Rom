import { useMemo, useState } from 'react'
import { getAllLocalMedicines } from '../lib/localMeds'
import { useListen } from '../components/ListenContext'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleOutline } from '@heroicons/react/24/outline'

export function ListenHub() {
  const all = useMemo(() => getAllLocalMedicines(), [])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { play, isOpen } = useListen()

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return all
    return all.filter(
      (m) =>
        m.genericName.toLowerCase().includes(term) ||
        m.brandName.toLowerCase().includes(term) ||
        m.drugClass.toLowerCase().includes(term)
    )
  }, [all, query])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((m) => m.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function playOne(id: string) {
    const med = all.find((m) => m.id === id)
    if (!med) return
    play([{ label: `${med.brandName} — overview`, text: `${med.genericName}, brand ${med.brandName}. ${med.indications} Common side effects: ${med.sideEffects}` }])
  }

  function playSelection() {
    const items = all
      .filter((m) => selected.has(m.id))
      .map((m) => ({
        label: `${m.brandName} — overview`,
        text: `${m.genericName}, brand ${m.brandName}. ${m.indications} Common side effects: ${m.sideEffects}`,
      }))
    if (items.length) play(items, 0)
  }

  function playAll() {
    const items = all.map((m) => ({
      label: `${m.brandName} — overview`,
      text: `${m.genericName}, brand ${m.brandName}. ${m.indications} Common side effects: ${m.sideEffects}`,
    }))
    play(items, 0)
  }

  return (
    <div className={`space-y-6 ${isOpen ? 'pb-24' : ''}`}>
      <div>
        <h1 className="text-2xl font-black tracking-tight">Listen Hub</h1>
        <p className="text-slate-500">Play one medication, a custom selection, or the entire Day 1 set back to back.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={playAll}
          className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Play all {all.length}
        </button>
        <button
          onClick={playSelection}
          disabled={selected.size === 0}
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Play selected ({selected.size})
        </button>
        <button
          onClick={selectAllFiltered}
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Select all shown
        </button>
        <button
          onClick={clearSelection}
          disabled={selected.size === 0}
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Clear
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by drug, brand, or class…"
        className="w-full rounded-full border border-orange-100 px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5"
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const isSelected = selected.has(m.id)
          return (
            <div
              key={m.id}
              className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white p-3 dark:border-white/10 dark:bg-white/5"
            >
              <button onClick={() => toggle(m.id)} className="shrink-0 text-brand-600">
                {isSelected ? <CheckCircleIcon className="h-6 w-6" /> : <CheckCircleOutline className="h-6 w-6" />}
              </button>
              <button onClick={() => toggle(m.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold">{m.brandName}</p>
                <p className="truncate text-xs text-slate-400">{m.genericName}</p>
              </button>
              <button
                onClick={() => playOne(m.id)}
                className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300"
              >
                ▶
              </button>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="text-slate-400">No matches for "{query}".</p>}
      </div>
    </div>
  )
}
