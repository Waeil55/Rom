import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { searchMedicines } from '../lib/openfda'
import { searchLocalMedicines } from '../lib/localMeds'
import { fetchDbMedicines } from '../lib/dbMedicines'
import { searchLibraryMedicines } from '../lib/medicineLibrary'
import type { Medicine } from '../lib/types'
import { useAppStore } from '../store/useAppStore'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'

export function Medicines() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const [input, setInput] = useState(q)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { bookmarks, toggleBookmark } = useAppStore()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErrorMsg(null)
    const local = searchLocalMedicines(q)
    const libraryMatches = searchLibraryMedicines(q)
    setMedicines([...local, ...libraryMatches])

    const term = q.trim().toLowerCase()
    fetchDbMedicines().then((dbMeds) => {
      if (cancelled) return
      const matches = term
        ? dbMeds.filter(
            (m) =>
              m.genericName.toLowerCase().includes(term) ||
              m.brandName.toLowerCase().includes(term) ||
              m.drugClass.toLowerCase().includes(term)
          )
        : dbMeds
      setMedicines((prev) => [...matches, ...prev])
    })

    searchMedicines(q, 30)
      .then((res) => {
        if (cancelled) return
        const seenGenerics = new Set([...local, ...libraryMatches].map((m) => m.genericName.toLowerCase()))
        const extra = res.filter((m) => !seenGenerics.has(m.genericName.toLowerCase()))
        setMedicines((prev) => [...prev, ...extra])
      })
      .catch(() => {
        if (!cancelled && local.length === 0) {
          setErrorMsg('Could not reach the live medicine database. Showing curated results only.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Medicines</h1>
        <p className="text-slate-500">Search the full drug reference — curated Day 1 set, extended library, and OpenFDA label data.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setParams(input ? { q: input } : {})
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. metformin, Lipitor, sertraline"
          className="flex-1 glass-input px-4 py-2.5 text-sm outline-none"
        />
        <button className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 shadow-lg shadow-brand-300/30 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 active:scale-95 transition-all">
          Search
        </button>
      </form>

      {loading && <p className="text-slate-400">Searching…</p>}
      {errorMsg && <p className="text-red-500">{errorMsg}</p>}
      {!loading && !errorMsg && medicines.length === 0 && (
        <p className="text-slate-400">No medicines found. Try a different name.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {medicines.map((m) => {
          const bookmarked = bookmarks.includes(m.id)
          return (
            <div
              key={m.id}
              className="relative glass-card p-4"
            >
              <button
                onClick={() => toggleBookmark(m.id)}
                className="absolute right-3 top-3 text-brand-600"
                aria-label="Bookmark"
              >
                {bookmarked ? <BookmarkSolid className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}
              </button>
              <Link to={`/medicines/${m.id}`}>
                <p className="pr-6 font-semibold">{m.brandName}</p>
                <p className="text-sm text-slate-500">{m.genericName}</p>
                <p className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                  {m.drugClass}
                </p>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
