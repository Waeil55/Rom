import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMedicineById } from '../lib/openfda'
import { getLocalMedicineById, enrichWithOpenFda, isLocalId } from '../lib/localMeds'
import type { Medicine, MedicineSection } from '../lib/types'
import { useAppStore } from '../store/useAppStore'
import { useListen } from '../components/ListenContext'
import { ListenButton } from '../components/ListenButton'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'

const SECTIONS: MedicineSection[] = [
  { key: 'mechanism', label: 'Mechanism of action' },
  { key: 'indications', label: 'Uses / indications' },
  { key: 'dosage', label: 'Dosage information' },
  { key: 'contraindications', label: 'Contraindications' },
  { key: 'warnings', label: 'Warnings' },
  { key: 'sideEffects', label: 'Side effects' },
  { key: 'interactions', label: 'Interactions' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'counseling', label: 'Patient counseling' },
  { key: 'pearls', label: 'Clinical pearls' },
]

export function MedicineDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [medicine, setMedicine] = useState<Medicine | null>(null)
  const [loading, setLoading] = useState(true)
  const { bookmarks, toggleBookmark, addRecentlyViewed } = useAppStore()
  const { play } = useListen()

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)

    async function load() {
      if (isLocalId(id!)) {
        const local = getLocalMedicineById(id!)
        if (!local) {
          if (!cancelled) setLoading(false)
          return
        }
        if (!cancelled) {
          setMedicine(local)
          addRecentlyViewed({ medicineId: local.id, brandName: local.brandName, genericName: local.genericName })
          setLoading(false)
        }
        const enriched = await enrichWithOpenFda(local)
        if (!cancelled) setMedicine(enriched)
        return
      }

      const m = await getMedicineById(id!)
      if (cancelled) return
      setMedicine(m)
      setLoading(false)
      if (m) addRecentlyViewed({ medicineId: m.id, brandName: m.brandName, genericName: m.genericName })
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id, addRecentlyViewed])

  if (loading) return <p className="text-slate-400">Loading medicine…</p>
  if (!medicine) {
    return (
      <div className="space-y-3">
        <p className="text-slate-500">This medicine could not be found.</p>
        <button onClick={() => navigate('/medicines')} className="text-brand-600 dark:text-brand-400">
          Back to Medicines
        </button>
      </div>
    )
  }

  const bookmarked = bookmarks.includes(medicine.id)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{medicine.brandName}</h1>
          <p className="text-slate-500">
            {medicine.genericName} · <span className="italic">{medicine.drugClass}</span>
          </p>
        </div>
        <button onClick={() => toggleBookmark(medicine.id)} className="text-brand-600" aria-label="Bookmark">
          {bookmarked ? <BookmarkSolid className="h-6 w-6" /> : <BookmarkIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <ListenButton
          label={`${medicine.brandName} — entire lesson`}
          text={SECTIONS.map((s) => `${s.label}. ${medicine[s.key]}`).join(' ')}
          size="md"
        />
        <Link
          to={`/study/flashcards?medicineId=${medicine.id}`}
          className="rounded-full border border-orange-100 px-3.5 py-2 text-sm font-medium hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Flashcards
        </Link>
        <Link
          to={`/study/quiz?medicineId=${medicine.id}`}
          className="rounded-full border border-orange-100 px-3.5 py-2 text-sm font-medium hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Quiz
        </Link>
        <button
          onClick={() =>
            play(
              SECTIONS.map((s) => ({ label: s.label, text: `${s.label}. ${medicine[s.key]}` })),
              0
            )
          }
          className="rounded-full border border-orange-100 px-3.5 py-2 text-sm font-medium hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900"
        >
          Listen section-by-section
        </button>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <section
            key={section.key}
            className="rounded-[28px] border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{section.label}</h2>
              <ListenButton label={`${medicine.brandName} — ${section.label}`} text={medicine[section.key]} />
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{medicine[section.key]}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
