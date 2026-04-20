import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type LayoutSidebarProps = {
  sideOpen: boolean
  onClose: () => void
  header: ReactNode
  nav: ReactNode
  footer: ReactNode
}

export function LayoutSidebar({ sideOpen, onClose, header, nav, footer }: LayoutSidebarProps) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 flex w-[85vw] min-w-[85vw] max-w-72 flex-shrink-0 flex-col
        transition-transform duration-300 ease-in-out
        lg:static lg:z-auto lg:w-64 lg:min-w-64 lg:max-w-64 lg:translate-x-0
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between px-5 pb-5 pt-6 lg:p-6">
        {header}
        <button
          onClick={onClose}
          className="btn-ghost rounded-lg p-1.5 lg:hidden"
          title="Close menu"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      {nav}
      {footer}
    </aside>
  )
}
