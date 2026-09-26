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
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <form onSubmit={onSearch} className="flex-1 max-w-xl">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
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
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
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
