import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { navItems } from './navItems'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-orange-100 bg-white transition-all duration-200 dark:border-white/10 dark:bg-cream-950 ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="h-9 w-9 shrink-0 rounded-[28px] bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center text-white font-bold shadow-md shadow-brand-300/40">
          Rx
        </div>
        {!collapsed && <span className="font-semibold text-lg">PharmaLearn</span>}
      </div>

      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
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
        className="mx-2 mb-4 flex items-center justify-center gap-2 rounded-lg border border-orange-100 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-slate-900"
      >
        {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
