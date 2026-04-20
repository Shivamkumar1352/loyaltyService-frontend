import { Link } from 'react-router-dom'
import { Skeleton } from '../../../shared/components'
import { fmt } from '../../../shared/utils'
import { TIER_COLORS } from '../constants'
import type { DashboardRewards } from '../types'

type RewardsSummaryProps = {
  rewards: DashboardRewards | null
  loading: boolean
}

export function RewardsSummary({ rewards, loading }: RewardsSummaryProps) {
  if (!rewards && !loading) return null

  const progressWidth = Math.min(
    100,
    (((rewards?.points ?? 0) / ((rewards?.points ?? 0) + (rewards?.pointsToNextTier ?? 0) || 1)) * 100),
  )

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Rewards & Loyalty</p>
        <Link to="/rewards" className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>View all →</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {fmt.number(rewards?.points)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Points</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: TIER_COLORS[rewards?.tier || 'BRONZE'] || 'var(--brand)' }}>
              {rewards?.tier || '—'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tier</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {fmt.number(rewards?.pointsToNextTier)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>To {rewards?.nextTier}</p>
          </div>
        </div>
      )}
      {!loading && rewards && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{rewards.tier}</span><span>{rewards.nextTier}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ background: 'linear-gradient(90deg, var(--brand), #3bcf88)', width: `${progressWidth}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
