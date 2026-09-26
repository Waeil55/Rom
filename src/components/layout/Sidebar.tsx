import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { navItems, moreNavItems } from './navItems'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`glass-panel hidden md:flex flex-col transition-all duration-200 ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="h-9 w-9 shrink-0 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold shadow-md shadow-brand-300/40">
          Rx
        </div>
        {!collapsed && <span className="font-black text-lg tracking-tight">PharmaLearn</span>}
      </div>

      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-400 to-brand-700 text-white shadow-md shadow-brand-300/30'
                      : 'text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5'
                  }`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {!collapsed && (
          <p className="mt-5 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            More
          </p>
        )}
        <ul className="space-y-1">
          {moreNavItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-400 to-brand-700 text-white shadow-md shadow-brand-300/30'
                      : 'text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5'
                  }`
                }
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="glass-card-sm mx-2 mb-4 flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-white/5"
      >
        {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
