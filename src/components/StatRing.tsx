interface StatRingProps {
  label: string
  value: string | number
  sublabel: string
  percent: number
  gradientFrom: string
  gradientTo: string
}

export function StatRing({ label, value, sublabel, percent, gradientFrom, gradientTo }: StatRingProps) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, percent) / 100) * circumference
  const gradId = `ring-${label.replace(/\s+/g, '-')}`

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-[28px] p-4 text-center backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.35))',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 8px 24px rgba(216,73,40,0.10)',
      }}
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientFrom} />
              <stop offset="100%" stopColor={gradientTo} />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-white/10" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute text-sm font-black">{value}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-[10px] text-slate-400">{sublabel}</p>
      </div>
    </div>
  )
}
