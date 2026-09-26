import { Link, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function TopBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  function onSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) navigate(`/medicines?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="glass-panel sticky top-0 z-30 flex items-center gap-3 px-4 py-3">
      <form onSubmit={onSearch} className="flex-1 max-w-xl">
        <div className="glass-input flex items-center gap-2 px-3 py-2">
          <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicines, brand or generic name..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2">
            <Link to="/settings" className="flex items-center gap-2 text-sm font-medium">
              <UserCircleIcon className="h-7 w-7 text-slate-400" />
              <span className="hidden sm:inline">{profile?.displayName ?? user.email}</span>
            </Link>
            <button
              onClick={() => signOut()}
              className="glass-card-sm px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 shadow-lg shadow-brand-300/30 px-4 py-1.5 text-sm font-semibold text-white hover:brightness-105 active:scale-95 transition-all"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
