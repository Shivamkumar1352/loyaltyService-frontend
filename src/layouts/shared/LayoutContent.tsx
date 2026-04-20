import { Outlet } from 'react-router-dom'

export function LayoutContent() {
  return (
    <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4 animate-fade-in sm:px-5 lg:px-6 lg:pb-6 lg:pt-6">
      <Outlet />
    </main>
  )
}
