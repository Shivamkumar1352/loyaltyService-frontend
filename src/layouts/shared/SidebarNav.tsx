import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from './navTypes'

type SidebarNavProps = {
  items: NavItem[]
  onNavigate: () => void
  accent: string
  accentText?: string
  extraLink?: ReactNode
}

export function SidebarNav({ items, onNavigate, accent, accentText = 'white', extraLink }: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-0.5 px-3 pb-3">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) => `
            flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
            ${isActive ? '' : 'hover:opacity-80'}
          `}
          style={({ isActive }) =>
            isActive
              ? { background: accent, color: accentText }
              : { color: 'var(--text-secondary)' }
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
      {extraLink}
    </nav>
  )
}
