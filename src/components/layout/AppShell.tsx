import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopBar } from './TopBar'
import { ListenBar } from '../ListenBar'

export function AppShell() {
  return (
    <div className="flex h-dvh overflow-hidden pt-[env(safe-area-inset-top)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
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
