import { ArrowLeftRight, Gift, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QUICK_ACTIONS } from '../constants'

const icons = {
  plus: Plus,
  transfer: ArrowLeftRight,
  gift: Gift,
}

export function QuickActions() {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Quick Actions
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ to, icon, label, color }) => {
          const Icon = icons[icon]
          return (
            <Link
              key={to}
              to={to}
              className="card flex min-h-24 flex-col items-center justify-center gap-2 px-2 py-4 text-center transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
