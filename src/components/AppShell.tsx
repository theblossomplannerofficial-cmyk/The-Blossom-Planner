import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

/** Kerangka aplikasi setelah lolos gate: header brand + konten + bottom navigation. */
export default function AppShell() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col">
      <header
        className="sticky top-0 z-10 flex items-center justify-center border-b border-ink/5 bg-cream/95 py-3 backdrop-blur"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
      >
        <img
          src="/logo-full.png"
          alt="Blossom Planner — Wedding & Event Planning"
          className="h-14 rounded-xl shadow-sm ring-1 ring-burgundy-deep/10"
        />
      </header>

      <main
        className="flex-1 px-5 pt-6"
        style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
