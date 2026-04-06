import { TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Skeleton } from '../../../shared/components'
import { fmt } from '../../../shared/utils'
import { FALLBACK_TX_ICON, TX_ICON_CLASSNAMES, TX_ICON_COMPONENTS } from '../constants'
import type { DashboardTransaction } from '../types'

type RecentTransactionsProps = {
  transactions: DashboardTransaction[]
  loading: boolean
}

export function RecentTransactions({ transactions, loading }: RecentTransactionsProps) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</p>
        <Link to="/transactions" className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>View all →</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-8 text-center">
          <TrendingUp size={32} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const incoming = ['TOPUP', 'CASHBACK', 'REDEEM'].includes(tx.type)
            const Icon = TX_ICON_COMPONENTS[tx.type] || FALLBACK_TX_ICON
            return (
              <div key={tx.id} className="group flex items-center gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <Icon size={14} className={TX_ICON_CLASSNAMES[tx.type]} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {tx.description || tx.type}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt.datetime(tx.createdAt)}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={`text-sm font-bold ${incoming ? 'text-green-500' : 'text-red-400'}`}>
                    {incoming ? '+' : '−'}{fmt.currency(tx.amount)}
                  </p>
                  <Badge status={tx.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
