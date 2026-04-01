import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ArrowLeftRight, Gift, TrendingUp, Eye, EyeOff, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react'
import { walletAPI, rewardsAPI } from '../../core/api'
import { useAuthStore } from '../../store'
import { fmt, statusClass } from '../../shared/utils'
import { Skeleton, Badge } from '../../shared/components'

const TX_ICONS = {
  TOPUP: <ArrowDownLeft size={14} className="text-green-500" />,
  TRANSFER: <ArrowUpRight size={14} className="text-red-400" />,
  WITHDRAW: <ArrowUpRight size={14} className="text-orange-400" />,
  CASHBACK: <ArrowDownLeft size={14} className="text-blue-400" />,
  REDEEM: <ArrowDownLeft size={14} className="text-purple-400" />,
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState(null)
  const [rewards, setRewards] = useState(null)
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [balanceVisible, setBalanceVisible] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [b, r, t] = await Promise.allSettled([
        walletAPI.getBalance(),
        rewardsAPI.getSummary(),
        walletAPI.getTransactions(0, 5),
      ])
      if (b.status === 'fulfilled') setBalance(b.value.data?.data)
      if (r.status === 'fulfilled') setRewards(r.value.data?.data)
      if (t.status === 'fulfilled') setTxns(t.value.data?.content || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const tierColors = { BRONZE: '#cd7f32', SILVER: '#9ca3af', GOLD: '#f59e0b', PLATINUM: '#8b5cf6' }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-slide-up">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Good day,</p>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {user?.fullName?.split(' ')[0] || 'Friend'} 👋
          </h1>
        </div>
        <button onClick={load} className="btn-ghost p-2 rounded-xl" title="Refresh">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Balance card */}
      <div className="rounded-2xl p-6 relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(135deg, #042a1d 0%, #097349 40%, #3bcf88 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm font-medium">Wallet Balance</p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/15">
                {balance?.status || 'ACTIVE'}
              </span>
              <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-white/70 hover:text-white transition-colors">
                {balanceVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          {loading
            ? <div className="shimmer-line h-10 w-40 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
            : <p className="text-4xl font-black tracking-tight mb-1">
                {balanceVisible ? fmt.currency(balance?.balance) : '₹ ••••••'}
              </p>
          }
          <p className="text-white/50 text-xs">
            Last updated {balance?.lastUpdated ? fmt.datetime(balance.lastUpdated) : '—'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/add-money', icon: Plus, label: 'Add Money', color: '#16b36e' },
            { to: '/transfer', icon: ArrowLeftRight, label: 'Send', color: '#3b82f6' },
            { to: '/rewards', icon: Gift, label: 'Rewards', color: '#8b5cf6' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className="card flex flex-col items-center gap-2 py-4 px-2 transition-all duration-200 hover:scale-[1.02] active:scale-95">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Rewards summary */}
      {(rewards || loading) && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Rewards & Loyalty</p>
            <Link to="/rewards" className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>View all →</Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {fmt.number(rewards?.points)}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Points</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-black" style={{ color: tierColors[rewards?.tier] || 'var(--brand)' }}>
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
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>{rewards.tier}</span><span>{rewards.nextTier}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    background: 'linear-gradient(90deg, var(--brand), #3bcf88)',
                    width: `${Math.min(100, ((rewards.points) / (rewards.points + rewards.pointsToNextTier)) * 100)}%`
                  }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</p>
          <Link to="/transactions" className="text-xs font-semibold" style={{ color: 'var(--brand)' }}>View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {txns.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  {TX_ICONS[tx.type] || <ArrowLeftRight size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {tx.description || tx.type}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt.datetime(tx.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${['TOPUP','CASHBACK','REDEEM'].includes(tx.type) ? 'text-green-500' : 'text-red-400'}`}>
                    {['TOPUP','CASHBACK','REDEEM'].includes(tx.type) ? '+' : '−'}{fmt.currency(tx.amount)}
                  </p>
                  <Badge status={tx.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
