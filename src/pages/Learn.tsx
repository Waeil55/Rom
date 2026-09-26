import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllLocalMedicines } from '../lib/localMeds'
import { fetchDbMedicines } from '../lib/dbMedicines'
import type { Medicine } from '../lib/types'
import { ListenButton } from '../components/ListenButton'

export function Learn() {
  const [dbMeds, setDbMeds] = useState<Medicine[]>([])

  useEffect(() => {
    void fetchDbMedicines().then(setDbMeds)
  }, [])

  const allMeds = useMemo(() => [...getAllLocalMedicines(), ...dbMeds], [dbMeds])

  const rows = useMemo(() => {
    const byClass = new Map<string, Medicine[]>()
    for (const m of allMeds) {
      const key = m.drugClass
      if (!byClass.has(key)) byClass.set(key, [])
      byClass.get(key)!.push(m)
    }
    return Array.from(byClass.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([label, medicines]) => ({ label, medicines }))
  }, [allMeds])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="text-slate-500">
          {allMeds.length} medications across {rows.length} drug classes — watch or listen to any of them.
        </p>
      </div>

      {rows.map((row) => (
        <section key={row.label}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{row.label}</h2>
            <Link
              to={`/medicines?q=${encodeURIComponent(row.label)}`}
              className="text-sm text-brand-600 dark:text-brand-400"
            >
              See all ({row.medicines.length})
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {row.medicines.map((m) => (
              <div
                key={m.id}
                className="min-w-[220px] shrink-0 rounded-[28px] border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
              >
                <Link to={`/medicines/${m.id}`} className="block">
                  <p className="font-semibold">{m.brandName}</p>
                  <p className="text-sm text-slate-500">{m.genericName}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{m.indications}</p>
                </Link>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/medicines/${m.id}`}
                    className="rounded-full border border-orange-100 px-2.5 py-1 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Watch
                  </Link>
                  <ListenButton
                    label={`${m.brandName} — full overview`}
                    text={`${m.genericName}, brand name ${m.brandName}. ${m.indications} Common side effects: ${m.sideEffects}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
