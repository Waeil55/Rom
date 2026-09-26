import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllDiseases, getAllSystems, getAllTags, searchDiseases } from '../lib/diseases'
import { BackButton } from '../components/BackButton'

export function Diseases() {
  const [query, setQuery] = useState('')
  const [system, setSystem] = useState<string>('All')
  const [tag, setTag] = useState<string>('All')

  const systems = useMemo(() => ['All', ...getAllSystems()], [])
  const tags = useMemo(() => ['All', ...getAllTags()], [])

  const results = useMemo(() => {
    let pool = query.trim() ? searchDiseases(query) : getAllDiseases()
    if (system !== 'All') pool = pool.filter((d) => d.system === system)
    if (tag !== 'All') pool = pool.filter((d) => d.tags.includes(tag))
    return pool
  }, [query, system, tag])

  return (
    <div className="space-y-6">
      <BackButton to="/study" label="Study" />
      <div>
        <h1 className="text-2xl font-black tracking-tight">Diseases</h1>
        <p className="text-slate-500">{getAllDiseases().length} conditions across {getAllSystems().length} body systems — browse by system or tag, or search.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/study/diseases/quiz"
          className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
        >
          Disease quiz
        </Link>
        <Link
          to="/study/diseases/flashcards"
          className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Flashcards
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by disease, alias, or tag…"
        className="w-full rounded-full border border-orange-100 px-4 py-2.5 text-sm outline-none focus:border-brand-400 dark:border-white/10 dark:bg-white/5"
      />

      <div className="flex flex-wrap gap-3">
        <select
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
        >
          {systems.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All systems' : s}
            </option>
          ))}
        </select>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
        >
          {tags.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All tags (e.g. acute, allergic, chronic)' : t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((d) => (
          <Link
            key={d.id}
            to={`/diseases/${d.id}`}
            className="rounded-[28px] border border-orange-100 bg-white p-4 hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
          >
            <p className="font-semibold">{d.name}</p>
            <p className="text-sm text-slate-500">{d.system}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-400">{d.overview}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {d.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                >
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
        {results.length === 0 && <p className="text-slate-400">No diseases match your filters.</p>}
      </div>
    </div>
  )
}
