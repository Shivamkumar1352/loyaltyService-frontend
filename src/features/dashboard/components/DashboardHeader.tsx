import { RefreshCw } from 'lucide-react'
import type { AuthUser } from '../../../store'

type DashboardHeaderProps = {
  user: AuthUser | null
  loading: boolean
  onRefresh: () => void
}

export function DashboardHeader({ user, loading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Good day,</p>
        <h1 className="truncate text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
          {user?.fullName?.split(' ')[0] || 'Friend'}
        </h1>
      </div>
      <button
        onClick={onRefresh}
        className="btn-ghost rounded-xl p-2"
        title="Refresh dashboard data"
        aria-label="Refresh dashboard data"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
