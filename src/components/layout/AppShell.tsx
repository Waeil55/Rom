import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { ListenBar } from '../ListenBar'

export function AppShell() {
  return (
    <div className="relative flex h-dvh overflow-hidden pt-[env(safe-area-inset-top)]">
      <div
        aria-hidden
        className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full opacity-40 blur-3xl dark:opacity-20"
        style={{ background: 'radial-gradient(circle, #FFC266, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-24 top-40 h-80 w-80 rounded-full opacity-30 blur-3xl dark:opacity-15"
        style={{ background: 'radial-gradient(circle, #AC94DE, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-1/3 h-72 w-72 rounded-full opacity-20 blur-3xl dark:opacity-10"
        style={{ background: 'radial-gradient(circle, #E85D36, transparent 70%)' }}
      />

      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <ListenBar />
      <BottomNav />
    </div>
  )
}
