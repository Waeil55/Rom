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
  HeartIcon,
} from '@heroicons/react/24/outline'

const SECTIONS = [
  { to: '/naplex', label: 'NAPLEX 2026', icon: AcademicCapIcon, desc: 'Full board-prep hub', gradient: 'from-brand-300 via-brand-400 to-brand-700' },
  { to: '/diseases', label: 'Diseases', icon: HeartIcon, desc: '162 conditions, 14 systems', gradient: 'from-rose-300 via-rose-400 to-rose-600' },
  { to: '/listen-hub', label: 'Listen Hub', icon: SpeakerWaveIcon, desc: 'Play one, many, or all', gradient: 'from-lilac-300 via-lilac-400 to-lilac-500' },
  { to: '/counseling', label: 'Counseling', icon: ChatBubbleLeftRightIcon, desc: 'Every counseling point', gradient: 'from-sky-300 via-sky-400 to-sky-600' },
]

const MODES = [
  { to: '/study/flashcards', label: 'Flashcards', icon: RectangleStackIcon },
  { to: '/study/quiz', label: 'Multiple choice', icon: ListBulletIcon },
  { to: '/study/quiz?mode=true-false', label: 'True / False', icon: ListBulletIcon },
  { to: '/study/matching', label: 'Matching', icon: ArrowsRightLeftIcon },
  { to: '/study/quiz?mode=fill-blank', label: 'Fill in blank', icon: PencilSquareIcon },
  { to: '/study/quiz?mode=brand-generic', label: 'Brand ↔ Generic', icon: BeakerIcon },
  { to: '/study/quiz', label: 'Rapid review', icon: BoltIcon },
  { to: '/study/weak-areas', label: 'Weak areas', icon: ExclamationTriangleIcon },
  { to: '/study/naplex-bank', label: '351-Q bank', icon: SparklesIcon },
]

export function Study() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Study</h1>
        <p className="text-slate-500">Pick a mode. Every card here works — no placeholders.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={`relative flex aspect-square flex-col items-center justify-center gap-2 overflow-hidden rounded-[28px] bg-gradient-to-br p-4 text-center text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95 ${s.gradient}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-sm">
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{s.label}</p>
              <p className="text-[10px] text-white/80">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">Study modes</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {MODES.map((m) => (
            <Link
              key={m.label}
              to={m.to}
              className="flex flex-col items-center gap-2 rounded-[24px] p-3 text-center backdrop-blur-xl transition-transform hover:scale-[1.04] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,140,66,0.08))',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 20px rgba(216,73,40,0.08)',
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-700 dark:from-brand-900/40 dark:to-brand-900/20 dark:text-brand-400">
                <m.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold leading-tight">{m.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
