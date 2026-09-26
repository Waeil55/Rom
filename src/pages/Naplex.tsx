import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllLocalMedicines } from '../lib/localMeds'
import { fetchDbMedicines } from '../lib/dbMedicines'
import { getAllLibraryMedicines } from '../lib/medicineLibrary'
import type { Medicine } from '../lib/types'
import { ListenButton } from '../components/ListenButton'
import { BackButton } from '../components/BackButton'

export function Naplex() {
  const [dbMeds, setDbMeds] = useState<Medicine[]>([])
  useEffect(() => {
    void fetchDbMedicines().then(setDbMeds)
  }, [])
  const all = useMemo(
    () => [...getAllLocalMedicines(), ...getAllLibraryMedicines(), ...dbMeds],
    [dbMeds]
  )
  const [query, setQuery] = useState('')

  const byClass = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = term
      ? all.filter(
          (m) =>
            m.genericName.toLowerCase().includes(term) ||
            m.brandName.toLowerCase().includes(term) ||
            m.drugClass.toLowerCase().includes(term)
        )
      : all
    const map = new Map<string, typeof all>()
    for (const m of filtered) {
      if (!map.has(m.drugClass)) map.set(m.drugClass, [])
      map.get(m.drugClass)!.push(m)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [all, query])

  const pearlsScript = useMemo(
    () => all.map((m) => `${m.genericName}. ${m.pearls}`).join(' '),
    [all]
  )

  return (
    <div className="space-y-6">
      <BackButton to="/study" label="Study" />
      <div>
        <h1 className="text-2xl font-black tracking-tight">NAPLEX 2026 — Day 1 Pharmacopeia</h1>
        <p className="text-slate-500">
          {all.length} board-relevant medications across {byClass.length} drug classes. Full board-mastery prep in
          one place.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/study/naplex-bank"
          className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          NAPLEX question bank
        </Link>
        <Link
          to="/study/quiz"
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Full board quiz
        </Link>
        <Link
          to="/study/flashcards"
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Flashcards
        </Link>
        <Link
          to="/study/matching"
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Brand ↔ Generic drill
        </Link>
        <Link
          to="/listen-hub"
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Listen to all
        </Link>
        <ListenButton label="All board pearls" text={pearlsScript} size="md" />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter by drug, brand, or class…"
        className="w-full rounded-full border border-orange-100 px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5"
      />

      <div className="space-y-6">
        {byClass.map(([drugClass, meds]) => (
          <section key={drugClass} className="rounded-[28px] border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">{drugClass}</h2>
              <span className="text-xs text-slate-400">{meds.length} drugs</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {meds.map((m) => (
                <Link
                  key={m.id}
                  to={`/medicines/${m.id}`}
                  className="flex items-center justify-between rounded-2xl border border-orange-100 px-3 py-2 text-sm hover:border-brand-300 dark:border-white/10"
                >
                  <span>
                    <span className="font-semibold">{m.genericName}</span>
                    <span className="text-slate-400"> · {m.brandName}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {byClass.length === 0 && <p className="text-slate-400">No matches for "{query}".</p>}
      </div>
    </div>
  )
}
