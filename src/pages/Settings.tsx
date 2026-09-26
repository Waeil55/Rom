import { Link } from 'react-router-dom'
import { useAppStore, type TextSize, type Theme } from '../store/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { useListen } from '../components/ListenContext'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

const VOICES: { value: string; label: string }[] = [
  { value: 'alloy', label: 'Alloy — neutral' },
  { value: 'echo', label: 'Echo — warm' },
  { value: 'fable', label: 'Fable — expressive' },
  { value: 'onyx', label: 'Onyx — deep' },
  { value: 'nova', label: 'Nova — bright' },
  { value: 'shimmer', label: 'Shimmer — soft' },
]

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
]

export function Settings() {
  const {
    theme,
    setTheme,
    textSize,
    setTextSize,
    reducedMotion,
    setReducedMotion,
    audioSpeed,
    setAudioSpeed,
    voice,
    setVoice,
    dailyGoalMinutes,
  } = useAppStore()
  const { user, profile, configured } = useAuth()
  const { play } = useListen()

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {!configured && (
        <div className="rounded-[28px] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable
          accounts, sync, and AI Listen.
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">Account</h2>
        <div className="glass-card-sm p-4 text-sm">
          <p>{user ? user.email : 'Not signed in'}</p>
          {profile && <p className="text-slate-500">Role: {profile.role}</p>}
          <p className="text-slate-500">Daily goal: {dailyGoalMinutes} min</p>
        </div>
        {profile?.role === 'admin' && (
          <Link
            to="/admin"
            className="inline-block rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-400"
          >
            Open admin dashboard →
          </Link>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                theme === t.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                  : 'border-orange-100 dark:border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Text size</h2>
        <div className="flex gap-2">
          {TEXT_SIZES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTextSize(t.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                textSize === t.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                  : 'border-orange-100 dark:border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Accessibility</h2>
        <label className="flex items-center justify-between glass-card-sm p-4">
          <span className="text-sm">Reduced motion</span>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Audio</h2>
        <div className="glass-card-sm space-y-4 p-4">
          <div>
            <label className="text-sm text-slate-500">Default playback speed: {audioSpeed.toFixed(2)}x</label>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.25}
              value={audioSpeed}
              onChange={(e) => setAudioSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-500">AI voice</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VOICES.map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVoice(v.value)}
                  className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-xs font-medium transition-all ${
                    voice === v.value
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'border-orange-100 dark:border-white/10'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                play([{ label: `Voice preview — ${voice}`, text: 'Hi, this is a preview of how I sound reading your pharmacy lessons.' }])
              }
              className="mt-3 rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
            >
              Preview this voice
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
