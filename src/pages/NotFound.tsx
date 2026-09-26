import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-slate-500">That route doesn't exist. Let's get you back on track.</p>
      <Link to="/" className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 shadow-lg shadow-brand-300/30 px-4 py-2 font-semibold text-white hover:brightness-105 active:scale-95 transition-all">
        Go home
      </Link>
    </div>
  )
}
