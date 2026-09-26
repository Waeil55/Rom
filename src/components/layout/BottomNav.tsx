import { NavLink } from 'react-router-dom'
import { navItems } from './navItems'

export function BottomNav() {
  return (
    <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center px-4 pointer-events-none md:hidden">
      <nav className="pointer-events-auto flex w-full max-w-[420px] items-center justify-between rounded-full border border-cream-900/10 bg-cream-950/95 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-md dark:border-white/10">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className="relative flex items-center justify-center">
            {({ isActive }) =>
              isActive ? (
                <span className="flex scale-105 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ) : (
                <span className="p-2 text-neutral-400 transition-colors hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
              )
            }
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
