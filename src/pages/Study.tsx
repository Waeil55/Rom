import { Link } from 'react-router-dom'
import {
  RectangleStackIcon,
  ListBulletIcon,
  ArrowsRightLeftIcon,
  PencilSquareIcon,
  BeakerIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  AcademicCapIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

const SECTIONS = [
  { to: '/naplex', label: 'NAPLEX 2026', icon: AcademicCapIcon, desc: 'Full board-prep hub, organized by drug class' },
  { to: '/listen-hub', label: 'Listen Hub', icon: SpeakerWaveIcon, desc: 'Play one, many, or all 120 medications' },
  { to: '/counseling', label: 'Counseling Points', icon: ChatBubbleLeftRightIcon, desc: 'Every patient counseling point, searchable' },
]

const MODES = [
  { to: '/study/flashcards', label: 'Flashcards', icon: RectangleStackIcon, desc: 'Classic spaced review cards' },
  { to: '/study/quiz', label: 'Multiple choice', icon: ListBulletIcon, desc: 'Test recall with 4-option questions' },
  { to: '/study/quiz?mode=true-false', label: 'True / False', icon: ListBulletIcon, desc: 'Quick fact checks' },
  { to: '/study/matching', label: 'Matching', icon: ArrowsRightLeftIcon, desc: 'Match brand to generic names' },
  { to: '/study/quiz?mode=fill-blank', label: 'Fill in the blank', icon: PencilSquareIcon, desc: 'Recall key terms' },
  { to: '/study/quiz?mode=brand-generic', label: 'Brand ↔ Generic', icon: BeakerIcon, desc: 'Drug naming drills' },
  { to: '/study/quiz', label: 'Rapid review', icon: BoltIcon, desc: '60-second speed rounds' },
  { to: '/study/weak-areas', label: 'Weak-area review', icon: ExclamationTriangleIcon, desc: 'Focus on what you miss most' },
  { to: '/study/quiz', label: 'AI-generated practice', icon: SparklesIcon, desc: 'Fresh questions from current lessons' },
]

export function Study() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study</h1>
        <p className="text-slate-500">Pick a mode. Every card here works — no placeholders.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="flex items-start gap-3 rounded-[28px] bg-gradient-to-br from-brand-50 to-white p-4 border border-brand-200 hover:border-brand-400 dark:border-brand-800 dark:from-white/5 dark:to-white/5"
          >
            <s.icon className="h-6 w-6 shrink-0 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="font-semibold">{s.label}</p>
              <p className="text-sm text-slate-500">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((m) => (
          <Link
            key={m.label}
            to={m.to}
            className="flex items-start gap-3 rounded-[28px] border border-orange-100 bg-white p-4 hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
          >
            <m.icon className="h-6 w-6 shrink-0 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="font-semibold">{m.label}</p>
              <p className="text-sm text-slate-500">{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
