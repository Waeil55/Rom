import { Component, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
    void this.reportError(error)
  }

  async reportError(error: Error) {
    if (!supabase) return
    try {
      const { data } = await supabase.auth.getSession()
      await supabase.from('client_error_log').insert({
        user_id: data.session?.user.id ?? null,
        message: error.message,
        stack: error.stack ?? null,
        route: window.location.pathname,
        user_agent: navigator.userAgent,
      })
    } catch {
      // Never let error reporting itself crash the app further.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex-col items-center justify-center gap-4 bg-cream-50 px-6 text-center dark:bg-cream-950">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-2xl font-bold text-white shadow-lg shadow-brand-300/40">
            !
          </div>
          <h1 className="text-xl font-black">Something went wrong</h1>
          <p className="max-w-xs text-sm text-slate-500">
            This screen hit an unexpected error. It's been logged — reloading usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-gradient-to-r from-brand-400 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-300/30 hover:brightness-105 active:scale-95 transition-all"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
