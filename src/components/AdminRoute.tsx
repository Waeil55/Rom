import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function AdminRoute() {
  const { profile, loading, configured } = useAuth()

  if (!configured) {
    return (
      <div className="rounded-[28px] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        Connect Supabase to enable the admin dashboard.
      </div>
    )
  }
  if (loading) {
    return <div className="flex h-full items-center justify-center py-24 text-slate-400">Loading…</div>
  }
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
