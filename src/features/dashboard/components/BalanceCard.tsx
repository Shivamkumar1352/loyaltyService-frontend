import { Eye, EyeOff } from 'lucide-react'
import { fmt } from '../../../shared/utils'
import type { DashboardBalance } from '../types'

type BalanceCardProps = {
  balance: DashboardBalance | null
  loading: boolean
  balanceVisible: boolean
  onToggleVisibility: () => void
}

export function BalanceCard({ balance, loading, balanceVisible, onToggleVisibility }: BalanceCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 text-white sm:p-6"
      style={{ background: 'linear-gradient(135deg, #042a1d 0%, #097349 40%, #3bcf88 100%)' }}
    >
      <div
        className="absolute right-0 top-0 h-64 w-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 h-48 w-48 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(-30%, 30%)' }}
      />

      <div className="relative">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-white/70">Wallet Balance</p>
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
              {balance?.status || 'ACTIVE'}
            </span>
            <button
              onClick={onToggleVisibility}
              className="text-white/70 transition-colors hover:text-white"
              title={balanceVisible ? 'Hide balance' : 'Show balance'}
              aria-label={balanceVisible ? 'Hide balance amount' : 'Show balance amount'}
            >
              {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="shimmer-line mb-1 h-10 w-32 rounded-lg sm:w-40" style={{ background: 'rgba(255,255,255,0.15)' }} />
        ) : (
          <p className="mb-1 break-words pr-2 text-3xl font-black tracking-tight sm:text-4xl">
            {balanceVisible ? fmt.currency(balance?.balance) : '₹ ••••••'}
          </p>
        )}
        <p className="max-w-full text-xs leading-relaxed text-white/50">
          Last updated {balance?.lastUpdated ? fmt.datetime(balance.lastUpdated) : '—'}
        </p>
      </div>
    </div>
  )
}
