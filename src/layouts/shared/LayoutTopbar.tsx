import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'

type LayoutTopbarProps = {
  onOpenMenu: () => void
  actions: ReactNode
}

export function LayoutTopbar({ onOpenMenu, actions }: LayoutTopbarProps) {
  return (
    <header
      className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 lg:px-6"
      style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
    >
      <button
        onClick={onOpenMenu}
        className="btn-ghost rounded-lg p-2 lg:hidden"
        title="Open menu"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-2">{actions}</div>
    </header>
  )
}
