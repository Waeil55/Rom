import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { FEATURED_QUERIES } from '../lib/openfda'
import { StatRing } from '../components/StatRing'

export function Home() {
  const { recentlyViewed, minutesStudiedToday, dailyGoalMinutes, mastery } = useAppStore()
  const { profile, user } = useAuth()

  const weakAreas = useMemo(() => {
    return Object.values(mastery)
      .filter((m) => m.incorrect > m.correct)
      .slice(0, 4)
  }, [mastery])

  const progressPct = Math.min(100, Math.round((minutesStudiedToday / dailyGoalMinutes) * 100))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-cream-900 dark:text-orange-50">
          Welcome back{profile?.displayName ? `, ${profile.displayName}` : user ? '' : ''}
        </h1>
        <p className="text-slate-500">Here's where you left off.</p>
      </div>

      <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1">
        <Link
          to="/study"
          className="relative flex h-40 min-w-[220px] flex-1 flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-r from-brand-300 via-brand-400 to-brand-700 p-5 text-white shadow-lg shadow-brand-300/30 transition-all hover:shadow-xl"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Continue
            </span>
            <span className="rounded-full bg-white/30 px-2 py-0.5 text-[10px] font-semibold">
              {dailyGoalMinutes - minutesStudiedToday > 0 ? `${dailyGoalMinutes - minutesStudiedToday} min left` : 'Goal met'}
            </span>
          </div>
          <div className="self-end text-right">
            <h3 className="text-base font-black leading-tight">Keep your streak going.</h3>
            <div className="mt-3 flex justify-end">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25">→</div>
            </div>
          </div>
        </Link>

        <Link
          to="/learn"
          className="flex h-40 w-36 shrink-0 flex-col justify-between overflow-hidden rounded-[32px] bg-gradient-to-br from-lilac-300 to-lilac-400 p-4 shadow-md shadow-lilac-400/20 transition-all hover:brightness-105"
        >
          <span className="w-fit rounded-full bg-white/40 px-2.5 py-0.5 text-[10px] font-bold text-lilac-500">
            AI Listen
          </span>
          <span className="text-3xl">🎧</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatRing
          label="Goal"
          value={`${progressPct}%`}
          sublabel={`${minutesStudiedToday}/${dailyGoalMinutes} min`}
          percent={progressPct}
          gradientFrom="#FF9C40"
          gradientTo="#E85D36"
        />
        <StatRing
          label="Viewed"
          value={recentlyViewed.length}
          sublabel="this week"
          percent={Math.min(100, recentlyViewed.length * 10)}
          gradientFrom="#AC94DE"
          gradientTo="#8F6FD1"
        />
        <StatRing
          label="Weak"
          value={weakAreas.length}
          sublabel="to review"
          percent={Math.min(100, weakAreas.length * 20)}
          gradientFrom="#FDA4AF"
          gradientTo="#E11D48"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/study" className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 shadow-lg shadow-brand-300/30 px-4 py-2 text-sm font-semibold text-white hover:brightness-105 active:scale-95 transition-all">
          Continue studying
        </Link>
        <Link to="/study/flashcards" className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900">
          Flashcards
        </Link>
        <Link to="/study/quiz" className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900">
          Quiz
        </Link>
        <Link to="/learn" className="rounded-full border border-orange-100 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-white/10 dark:hover:bg-slate-900">
          AI Listen
        </Link>
      </div>

      {recentlyViewed.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recently viewed</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyViewed.map((r) => (
              <Link
                key={r.medicineId}
                to={`/medicines/${r.medicineId}`}
                className="min-w-[180px] shrink-0 rounded-[28px] border border-orange-100 bg-white p-4 hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
              >
                <p className="font-semibold">{r.brandName}</p>
                <p className="text-sm text-slate-500">{r.genericName}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recommended categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FEATURED_QUERIES.map((c) => (
            <Link
              key={c.label}
              to={`/medicines?q=${encodeURIComponent(c.query)}`}
              className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-brand-50 to-white p-4 font-medium hover:border-brand-300 dark:border-white/10 dark:from-slate-900 dark:to-slate-900"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
