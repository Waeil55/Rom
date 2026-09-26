import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllLocalMedicines } from '../lib/localMeds'
import { fetchDbMedicines } from '../lib/dbMedicines'
import { getAllLibraryMedicines } from '../lib/medicineLibrary'
import type { Medicine } from '../lib/types'
import { useListen } from '../components/ListenContext'
import { PlayIcon } from '@heroicons/react/24/solid'

const THUMB_GRADIENTS = [
  'from-brand-300 to-brand-700',
  'from-lilac-300 to-lilac-500',
  'from-rose-300 to-rose-600',
  'from-sky-300 to-sky-600',
  'from-amber-300 to-orange-600',
  'from-emerald-300 to-teal-600',
]

export function Learn() {
  const [dbMeds, setDbMeds] = useState<Medicine[]>([])
  const { play } = useListen()

  useEffect(() => {
    void fetchDbMedicines().then(setDbMeds)
  }, [])

  const allMeds = useMemo(
    () => [...getAllLocalMedicines(), ...getAllLibraryMedicines(), ...dbMeds],
    [dbMeds]
  )

  const rows = useMemo(() => {
    const byClass = new Map<string, Medicine[]>()
    for (const m of allMeds) {
      const key = m.drugClass
      if (!byClass.has(key)) byClass.set(key, [])
      byClass.get(key)!.push(m)
    }
    return Array.from(byClass.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, medicines], i) => ({ label, medicines, gradient: THUMB_GRADIENTS[i % THUMB_GRADIENTS.length] }))
  }, [allMeds])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Learn</h1>
        <p className="text-slate-500">
          {allMeds.length} lessons across {rows.length} categories — tap a card to open it, or press play to have it
          narrated to you.
        </p>
      </div>

      {rows.map((row) => (
        <section key={row.label}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">{row.label}</h2>
            <Link
              to={`/medicines?q=${encodeURIComponent(row.label)}`}
              className="text-sm font-medium text-brand-600 dark:text-brand-400"
            >
              See all ({row.medicines.length})
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {row.medicines.map((m) => (
              <div
                key={m.id}
                className="w-[220px] shrink-0 overflow-hidden rounded-[24px] bg-white shadow-sm dark:bg-white/5"
              >
                <Link
                  to={`/medicines/${m.id}`}
                  className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${row.gradient}`}
                >
                  <span className="absolute left-2 top-2 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    LESSON
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      play([
                        {
                          label: `${m.brandName} — full overview`,
                          text: `${m.genericName}, brand name ${m.brandName}. ${m.indications} Common side effects: ${m.sideEffects}`,
                        },
                      ])
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-lg transition-transform hover:scale-110 active:scale-95"
                    aria-label={`Play ${m.brandName} narration`}
                  >
                    <PlayIcon className="h-6 w-6 translate-x-0.5" />
                  </button>
                </Link>
                <Link to={`/medicines/${m.id}`} className="block p-3">
                  <p className="truncate font-semibold">{m.brandName}</p>
                  <p className="truncate text-sm text-slate-500">{m.genericName}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{m.indications}</p>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
