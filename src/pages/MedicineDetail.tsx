import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMedicineById } from '../lib/openfda'
import { getLocalMedicineById, getRelatedLocalMedicines, enrichWithOpenFda, isLocalId } from '../lib/localMeds'
import { getDbMedicineById, isDbId } from '../lib/dbMedicines'
import { getLibraryMedicineById, getRawLibraryMedicine, isLibraryId } from '../lib/medicineLibrary'
import type { Medicine, MedicineSection } from '../lib/types'
import { useAppStore } from '../store/useAppStore'
import { useListen } from '../components/ListenContext'
import { ListenButton } from '../components/ListenButton'
import { BookmarkIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
import { BackButton } from '../components/BackButton'

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

      if (isLibraryId(id!)) {
        const libMed = getLibraryMedicineById(id!)
        if (!cancelled) {
          setMedicine(libMed)
          setLoading(false)
          if (libMed) addRecentlyViewed({ medicineId: libMed.id, brandName: libMed.brandName, genericName: libMed.genericName })
        }
        return
      }

      if (isDbId(id!)) {
        const dbMed = await getDbMedicineById(id!)
        if (!cancelled) {
          setMedicine(dbMed)
          setLoading(false)
          if (dbMed) addRecentlyViewed({ medicineId: dbMed.id, brandName: dbMed.brandName, genericName: dbMed.genericName })
        }
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
  const related = isLocalId(medicine.id) ? getRelatedLocalMedicines(medicine) : []
  const rawLibrary = isLibraryId(medicine.id) ? getRawLibraryMedicine(medicine.id) : null

  return (
    <div className="space-y-6">
      <BackButton to="/medicines" label="Medicines" />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{medicine.brandName}</h1>
          <p className="text-slate-500">
            {medicine.genericName}
            {medicine.pronunciation && (
              <span className="text-slate-400"> ({medicine.pronunciation})</span>
            )}
            {' · '}
            <span className="italic">{medicine.drugClass}</span>
          </p>
        </div>
        <button onClick={() => toggleBookmark(medicine.id)} className="text-brand-600" aria-label="Bookmark">
          {bookmarked ? <BookmarkSolid className="h-6 w-6" /> : <BookmarkIcon className="h-6 w-6" />}
        </button>
      </div>

      {rawLibrary?.blackBoxWarning && (
        <div className="rounded-[28px] border-2 border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-400">⚠ Boxed Warning</p>
          <p className="mt-1 text-sm text-red-800 dark:text-red-300">{rawLibrary.blackBoxWarning}</p>
        </div>
      )}

      {rawLibrary && (rawLibrary.pregnancy || rawLibrary.schedule || rawLibrary.nursing) && (
        <div className="flex flex-wrap gap-2">
          {rawLibrary.schedule && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Schedule: {rawLibrary.schedule}
            </span>
          )}
          {rawLibrary.pregnancy && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Pregnancy category: {rawLibrary.pregnancy}
            </span>
          )}
          {rawLibrary.nursing && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              Nursing: {rawLibrary.nursing}
            </span>
          )}
        </div>
      )}

      {rawLibrary?.mnemonics && rawLibrary.mnemonics.length > 0 && (
        <div className="rounded-[28px] border border-lilac-300 bg-lilac-100/50 p-4 dark:border-lilac-400/30 dark:bg-lilac-400/10">
          <p className="text-xs font-bold uppercase tracking-wide text-lilac-500">Mnemonics</p>
          <ul className="mt-1 ml-4 list-disc text-sm text-slate-600 dark:text-slate-300">
            {rawLibrary.mnemonics.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

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
            className="glass-card p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{section.label}</h2>
              <ListenButton label={`${medicine.brandName} — ${section.label}`} text={medicine[section.key]} />
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{medicine[section.key]}</p>
          </section>
        ))}
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Related medicines</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {related.map((m) => (
              <Link
                key={m.id}
                to={`/medicines/${m.id}`}
                className="min-w-[180px] shrink-0 rounded-2xl border border-orange-100 bg-white p-3 hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
              >
                <p className="font-semibold">{m.brandName}</p>
                <p className="text-sm text-slate-500">{m.genericName}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        For study purposes only. Confirm dosing, contraindications, and clinical decisions against current
        official prescribing information before any real-world use.
      </p>
    </div>
  )
}
