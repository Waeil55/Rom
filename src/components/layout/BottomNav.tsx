import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export function BottomNav() {
  return (
    <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center px-4 pointer-events-none md:hidden">
      <nav
        className="pointer-events-auto flex w-full max-w-[420px] items-center justify-between rounded-[28px] px-2 py-2 backdrop-blur-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px rgba(216, 73, 40, 0.18), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="relative flex flex-1 items-center justify-center">
            {({ isActive }) =>
              isActive ? (
                <span className="flex flex-col items-center gap-0.5 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 px-3 py-1.5 text-white shadow-lg shadow-brand-500/40">
                  <Icon className="h-5 w-5" />
                  <span className="text-[9px] font-bold leading-none">{label.split(' ')[0]}</span>
                </span>
              ) : (
                <span className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-cream-900/60 transition-colors dark:text-white/60">
                  <Icon className="h-5 w-5" />
                  <span className="text-[9px] font-medium leading-none">{label.split(' ')[0]}</span>
                </span>
              )
            }
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
