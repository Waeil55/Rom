import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DAY_1_MEDICATIONS } from '../data/medications'
import { ListenButton } from '../components/ListenButton'
import { BackButton } from '../components/BackButton'

export function Counseling() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return DAY_1_MEDICATIONS
    return DAY_1_MEDICATIONS.filter(
      (m) => m.genericName.toLowerCase().includes(term) || m.brandName.toLowerCase().includes(term)
    )
  }, [query])

  return (
    <div className="space-y-6">
      <BackButton to="/study" label="Study" />
      <div>
        <h1 className="text-2xl font-black tracking-tight">Patient Counseling Points</h1>
        <p className="text-slate-500">Every key counseling point across all {DAY_1_MEDICATIONS.length} medications, in one searchable place.</p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by drug or brand name…"
        className="w-full rounded-full border border-orange-100 px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5"
      />

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-[28px] border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <Link to={`/medicines/local-${m.id}`} className="min-w-0">
                <p className="font-semibold">
                  {m.genericName} <span className="font-normal text-slate-400">· {m.brandName}</span>
                </p>
              </Link>
              <ListenButton label={`${m.genericName} counseling`} text={m.counseling.join(' ')} />
            </div>
            <ul className="ml-4 list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {m.counseling.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-slate-400">No matches for "{query}".</p>}
      </div>
    </div>
  )
}
