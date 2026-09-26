import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { user, loading, configured } = useAuth()

  if (!configured) return <Outlet />
  if (loading) {
    return <div className="flex h-full items-center justify-center py-24 text-slate-400">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
