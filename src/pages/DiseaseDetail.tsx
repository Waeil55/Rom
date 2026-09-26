import { Link, useNavigate, useParams } from 'react-router-dom'
import { getDiseaseById, getFullDiseaseScript, getDiseasesBySystem } from '../lib/diseases'
import { useListen } from '../components/ListenContext'
import { ListenButton } from '../components/ListenButton'
import { BackButton } from '../components/BackButton'
import { SpeakerWaveIcon } from '@heroicons/react/24/solid'

const SECTIONS: { key: 'overview' | 'pathophysiology' | 'diagnosis' | 'treatment' | 'complications'; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'pathophysiology', label: 'Pathophysiology' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'treatment', label: 'Treatment' },
  { key: 'complications', label: 'Complications' },
]

export function DiseaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { play } = useListen()
  const disease = id ? getDiseaseById(id) : null

  if (!disease) {
    return (
      <div className="space-y-3">
        <p className="text-slate-500">This disease could not be found.</p>
        <button onClick={() => navigate('/diseases')} className="text-brand-600 dark:text-brand-400">
          Back to Diseases
        </button>
      </div>
    )
  }

  const related = getDiseasesBySystem(disease.system).filter((d) => d.id !== disease.id).slice(0, 6)

  return (
    <div className="space-y-6">
      <BackButton to="/diseases" label="Diseases" />

      <div>
        <h1 className="text-2xl font-bold">{disease.name}</h1>
        <p className="text-slate-500">
          {disease.aliases.join(', ')}
          {disease.aliases.length > 0 && ' · '}
          <span className="italic">{disease.system}</span> · ICD-10 {disease.icd10}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {disease.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => play([{ label: `${disease.name} — full detail`, text: getFullDiseaseScript(disease) }])}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
      >
        <SpeakerWaveIcon className="h-5 w-5" />
        Listen to everything about {disease.name}
      </button>

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <section
            key={section.key}
            className="glass-card p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{section.label}</h2>
              <ListenButton label={`${disease.name} — ${section.label}`} text={disease[section.key]} />
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{disease[section.key]}</p>
          </section>
        ))}
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">More in {disease.system}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {related.map((d) => (
              <Link
                key={d.id}
                to={`/diseases/${d.id}`}
                className="min-w-[180px] shrink-0 rounded-2xl border border-orange-100 bg-white p-3 hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
              >
                <p className="font-semibold">{d.name}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{d.overview}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="rounded-[28px] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        For study purposes only. Confirm clinical decisions against current official references.
      </p>
    </div>
  )
}
