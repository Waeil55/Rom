import { useEffect, useMemo, useState } from 'react'
import { getAllLocalMedicines } from '../lib/localMeds'
import { getAllLibraryMedicines } from '../lib/medicineLibrary'
import { fetchDbMedicines } from '../lib/dbMedicines'
import { getAllDiseases, getFullDiseaseScript } from '../lib/diseases'
import { DAY_1_MEDICATIONS } from '../data/medications'
import { useListen } from '../components/ListenContext'
import { useAppStore } from '../store/useAppStore'
import type { TeachingStyle, Medicine } from '../lib/types'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleOutline } from '@heroicons/react/24/outline'
import { BackButton } from '../components/BackButton'

type ContentType = 'medicines' | 'diseases' | 'counseling'

interface ListenItem {
  id: string
  title: string
  subtitle: string
  script: string
}

const STYLE_OPTIONS: { value: TeachingStyle; label: string; hint: string }[] = [
  { value: 'read-exactly', label: 'Just read', hint: 'Fastest — no AI rewrite' },
  { value: 'explain-simply', label: 'With explanation', hint: 'Simple, plain-language' },
  { value: 'teach-professor', label: 'Full detailed', hint: 'Professor-level depth' },
  { value: 'exam-review', label: 'Exam review', hint: 'High-yield facts only' },
  { value: 'clinical-explanation', label: 'Clinical', hint: 'Real-world practice focus' },
  { value: 'quick-review', label: 'Quick review', hint: 'Very brief, rapid-fire' },
]

export function ListenHub() {
  const [contentType, setContentType] = useState<ContentType>('medicines')
  const [dbMeds, setDbMeds] = useState<Medicine[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showStyles, setShowStyles] = useState(false)
  const { play, isOpen, autoAdvance, setAutoAdvance } = useListen()
  const { teachingStyle, setTeachingStyle } = useAppStore()

  useEffect(() => {
    void fetchDbMedicines().then(setDbMeds)
  }, [])

  const items = useMemo<ListenItem[]>(() => {
    if (contentType === 'medicines') {
      const all = [...getAllLocalMedicines(), ...getAllLibraryMedicines(), ...dbMeds]
      return all.map((m) => ({
        id: m.id,
        title: m.brandName,
        subtitle: m.genericName,
        script: `${m.genericName}, brand ${m.brandName}. ${m.indications} Common side effects: ${m.sideEffects}`,
      }))
    }
    if (contentType === 'diseases') {
      return getAllDiseases().map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: d.system,
        script: getFullDiseaseScript(d),
      }))
    }
    return DAY_1_MEDICATIONS.map((m) => ({
      id: m.id,
      title: m.genericName,
      subtitle: m.brandName,
      script: m.counseling.join(' '),
    }))
  }, [contentType, dbMeds])

  useEffect(() => {
    setSelected(new Set())
    setQuery('')
  }, [contentType])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((i) => i.title.toLowerCase().includes(term) || i.subtitle.toLowerCase().includes(term))
  }, [items, query])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAllFiltered() {
    setSelected(new Set(filtered.map((i) => i.id)))
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function playOne(id: string) {
    const item = items.find((i) => i.id === id)
    if (!item) return
    play([{ label: `${item.title} — overview`, text: item.script }])
  }

  function playSelection() {
    const chosen = items
      .filter((i) => selected.has(i.id))
      .map((i) => ({ label: `${i.title} — overview`, text: i.script }))
    if (chosen.length) play(chosen, 0)
  }

  function playAll() {
    play(
      items.map((i) => ({ label: `${i.title} — overview`, text: i.script })),
      0
    )
  }

  return (
    <div className={`space-y-6 ${isOpen ? 'pb-24' : ''}`}>
      <BackButton to="/study" label="Study" />
      <div>
        <h1 className="text-2xl font-black tracking-tight">Listen Hub</h1>
        <p className="text-slate-500">
          Build a playlist across medicines, diseases, or counseling points — perfect for studying hands-free
          during a drive or commute.
        </p>
      </div>

      <div className="flex gap-2">
        {(['medicines', 'diseases', 'counseling'] as ContentType[]).map((t) => (
          <button
            key={t}
            onClick={() => setContentType(t)}
            className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition-all ${
              contentType === t
                ? 'bg-gradient-to-r from-brand-400 to-brand-700 text-white shadow-md shadow-brand-300/30'
                : 'glass-card-sm text-slate-600 dark:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="glass-card-sm p-4">
        <button onClick={() => setShowStyles((v) => !v)} className="flex w-full items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Speaking style: <span className="text-brand-600 dark:text-brand-400">{STYLE_OPTIONS.find((s) => s.value === teachingStyle)?.label}</span>
          </span>
          <span className="text-xs text-slate-400">{showStyles ? 'Hide' : 'Change'}</span>
        </button>
        {showStyles && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setTeachingStyle(s.value)}
                className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                  teachingStyle === s.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-orange-100 dark:border-white/10'
                }`}
              >
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-[10px] text-slate-400">{s.hint}</p>
              </button>
            ))}
          </div>
        )}
        <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={autoAdvance} onChange={(e) => setAutoAdvance(e.target.checked)} />
          Auto-play next item continuously (for drive/hands-free listening)
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={playAll}
          className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Play all {items.length}
        </button>
        <button
          onClick={playSelection}
          disabled={selected.size === 0}
          className="glass-card-sm px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Play selected ({selected.size})
        </button>
        <button onClick={selectAllFiltered} className="glass-card-sm px-4 py-2 text-sm font-semibold">
          Select all shown
        </button>
        <button
          onClick={clearSelection}
          disabled={selected.size === 0}
          className="glass-card-sm px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Filter ${contentType}…`}
        className="w-full glass-input px-4 py-2.5 text-sm outline-none"
      />

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => {
          const isSelected = selected.has(i.id)
          return (
            <div key={i.id} className="glass-card-sm flex items-center gap-2 p-3">
              <button
                onClick={() => toggle(i.id)}
                aria-label={isSelected ? `Deselect ${i.title}` : `Select ${i.title}`}
                className="shrink-0 text-brand-600"
              >
                {isSelected ? <CheckCircleIcon className="h-6 w-6" /> : <CheckCircleOutline className="h-6 w-6" />}
              </button>
              <button onClick={() => toggle(i.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold">{i.title}</p>
                <p className="truncate text-xs text-slate-400">{i.subtitle}</p>
              </button>
              <button
                onClick={() => playOne(i.id)}
                aria-label={`Play ${i.title}`}
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
