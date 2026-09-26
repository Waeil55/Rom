import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface AdminProfileRow {
  id: string
  email: string
  display_name: string
  role: 'student' | 'admin'
  created_at: string
}

interface AuditRow {
  id: string
  actor_id: string | null
  action: string
  target: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type Tab = 'users' | 'audit'

export function AdminDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('users')
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([])
  const [audit, setAudit] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, created_at')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setProfiles(data as AdminProfileRow[])
  }, [])

  const loadAudit = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('audit_log')
      .select('id, actor_id, action, target, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) setError(error.message)
    else setAudit(data as AuditRow[])
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([loadUsers(), loadAudit()]).finally(() => setLoading(false))
  }, [loadUsers, loadAudit])

  async function toggleRole(row: AdminProfileRow) {
    if (!supabase || !user) return
    const nextRole = row.role === 'admin' ? 'student' : 'admin'
    if (row.id === user.id) {
      setError("You can't change your own role from here — ask another admin.")
      return
    }
    setBusyId(row.id)
    setError(null)
    const { error: updateError } = await supabase.from('profiles').update({ role: nextRole }).eq('id', row.id)
    if (updateError) {
      setError(updateError.message)
      setBusyId(null)
      return
    }
    await supabase.from('audit_log').insert({
      actor_id: user.id,
      action: 'role_change',
      target: row.id,
      metadata: { email: row.email, from: row.role, to: nextRole },
    })
    await Promise.all([loadUsers(), loadAudit()])
    setBusyId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-slate-500">Manage user roles and review administrative activity.</p>
      </div>

      <div className="flex gap-2 border-b border-orange-100 dark:border-white/10">
        {(['users', 'audit'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize border-b-2 -mb-px ${
              tab === t
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500'
            }`}
          >
            {t === 'users' ? 'Users' : 'Audit log'}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      {loading && <p className="text-slate-400">Loading…</p>}

      {!loading && tab === 'users' && (
        <div className="overflow-x-auto rounded-[28px] border border-orange-100 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Joined</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-white/10">
                  <td className="px-4 py-2.5">{p.display_name || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{p.email}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.role === 'admin'
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => toggleRole(p)}
                      disabled={busyId === p.id || p.id === user?.id}
                      className="rounded-full border border-orange-100 px-3 py-1 text-xs font-medium hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {busyId === p.id ? 'Saving…' : p.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                    </button>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'audit' && (
        <div className="space-y-2">
          {audit.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-orange-100 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{a.action}</span>
                <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
              </div>
              {a.metadata && (
                <pre className="mt-1 overflow-x-auto text-xs text-slate-500">{JSON.stringify(a.metadata)}</pre>
              )}
            </div>
          ))}
          {audit.length === 0 && <p className="text-slate-400">No administrative actions logged yet.</p>}
        </div>
      )}
    </div>
  )
}
