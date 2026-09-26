import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { prepareFileForExtraction } from '../../lib/fileExtraction'
import { extractMedicineFromFile, type ExtractedMedicineDraft } from '../../lib/medicineExtraction'
import { fetchDbMedicines, saveDbMedicine, deleteDbMedicine } from '../../lib/dbMedicines'
import type { Medicine } from '../../lib/types'
import { ArrowUpTrayIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline'

const EMPTY_DRAFT: ExtractedMedicineDraft = {
  brandName: '',
  genericName: '',
  pronunciation: '',
  drugClass: '',
  mechanism: '',
  indications: '',
  dosage: '',
  contraindications: '',
  warnings: '',
  sideEffects: '',
  interactions: '',
  monitoring: '',
  counseling: '',
  pearls: '',
}

const FIELD_LABELS: { key: keyof ExtractedMedicineDraft; label: string; multiline?: boolean }[] = [
  { key: 'brandName', label: 'Brand name' },
  { key: 'genericName', label: 'Generic name' },
  { key: 'pronunciation', label: 'Pronunciation' },
  { key: 'drugClass', label: 'Drug class' },
  { key: 'mechanism', label: 'Mechanism of action', multiline: true },
  { key: 'indications', label: 'Indications', multiline: true },
  { key: 'dosage', label: 'Dosage', multiline: true },
  { key: 'contraindications', label: 'Contraindications', multiline: true },
  { key: 'warnings', label: 'Warnings', multiline: true },
  { key: 'sideEffects', label: 'Side effects', multiline: true },
  { key: 'interactions', label: 'Interactions', multiline: true },
  { key: 'monitoring', label: 'Monitoring', multiline: true },
  { key: 'counseling', label: 'Counseling points', multiline: true },
  { key: 'pearls', label: 'Clinical pearls', multiline: true },
]

export function AddMedicine() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState<ExtractedMedicineDraft>(EMPTY_DRAFT)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [source, setSource] = useState<'manual' | 'ai-extracted'>('manual')
  const [existing, setExisting] = useState<Medicine[]>([])
  const [existingClasses, setExistingClasses] = useState<string[]>([])

  const loadExisting = useCallback(async () => {
    const meds = await fetchDbMedicines()
    setExisting(meds)
    setExistingClasses(Array.from(new Set(meds.map((m) => m.drugClass))).sort())
  }, [])

  useEffect(() => {
    void loadExisting()
  }, [loadExisting])

  function setField<K extends keyof ExtractedMedicineDraft>(key: K, value: string) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  async function handleFile(file: File) {
    setExtracting(true)
    setError(null)
    setSuccess(null)
    try {
      const prepared = await prepareFileForExtraction(file)
      const result = await extractMedicineFromFile(prepared)
      setDraft(result)
      setSource('ai-extracted')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extraction failed.')
    } finally {
      setExtracting(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  async function handleSave() {
    if (!user) return
    if (!draft.brandName.trim() || !draft.genericName.trim() || !draft.drugClass.trim()) {
      setError('Brand name, generic name, and drug class are required.')
      return
    }
    setSaving(true)
    setError(null)
    const { error: saveError } = await saveDbMedicine(draft, source, user.id)
    setSaving(false)
    if (saveError) {
      setError(saveError)
      return
    }
    setSuccess(`${draft.brandName} added to the library.`)
    setDraft(EMPTY_DRAFT)
    setSource('manual')
    void loadExisting()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this medicine from the library?')) return
    const { error: delError } = await deleteDbMedicine(id)
    if (delError) setError(delError)
    else void loadExisting()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Medicine</h1>
        <p className="text-slate-500">
          Upload a photo, PDF, DOCX, or text file to extract data with AI, or fill the form manually. Review
          everything before saving — nothing is published without your confirmation.
        </p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20">{error}</p>}
      {success && (
        <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </p>
      )}

      <div className="rounded-[28px] border border-dashed border-brand-300 bg-brand-50/50 p-6 text-center dark:border-brand-800 dark:bg-brand-900/10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.docx,.txt,.md"
          onChange={onFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={extracting}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {extracting ? (
            <>
              <SparklesIcon className="h-4 w-4 animate-pulse" /> Extracting…
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="h-4 w-4" /> Upload photo, PDF, DOCX, or text
            </>
          )}
        </button>
        <p className="mt-2 text-xs text-slate-500">
          Take a photo of a label or package insert page, or upload a file — AI fills the form below for you to
          review.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELD_LABELS.map(({ key, label, multiline }) => (
          <div key={key} className={multiline ? 'sm:col-span-2' : ''}>
            <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
            {key === 'drugClass' ? (
              <input
                list="existing-classes"
                value={draft[key]}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              />
            ) : multiline ? (
              <textarea
                value={draft[key]}
                onChange={(e) => setField(key, e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              />
            ) : (
              <input
                value={draft[key]}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
              />
            )}
          </div>
        ))}
        <datalist id="existing-classes">
          {existingClasses.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save to library'}
      </button>

      {existing.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Admin-added medicines ({existing.length})</h2>
          <div className="space-y-2">
            {existing.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white p-3 dark:border-white/10 dark:bg-white/5"
              >
                <div>
                  <p className="font-medium">
                    {m.brandName} <span className="font-normal text-slate-400">· {m.genericName}</span>
                  </p>
                  <p className="text-xs text-slate-400">{m.drugClass}</p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  aria-label={`Remove ${m.brandName}`}
                  className="text-red-500 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
