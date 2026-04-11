import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, RefreshCw, TrendingDown, TrendingUp, BarChart3 } from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from 'recharts'
import { rewardsAPI, walletAPI } from '../../core/api'
import { Skeleton, StatCard } from '../../shared/components'
import { fmt } from '../../shared/utils'

const COLORS = ['#16b36e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#9ca3af']
const POLL_MS = 20_000

function sumBy<T>(items: T[], getKey: (x: T) => string, getVal: (x: T) => number) {
  const m = new Map<string, number>()
  items.forEach((x) => {
    const k = getKey(x)
    const v = getVal(x)
    m.set(k, (m.get(k) ?? 0) + (Number.isFinite(v) ? v : 0))
  })
  return Array.from(m.entries()).map(([name, value]) => ({ name, value }))
}

/** Last 7 calendar days, bucket successful tx amounts by day label */
function buildDailySeries(txns: { createdAt?: string; amount?: number; status?: string }[]) {
  const byDay = new Map<string, number>()
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    byDay.set(key, 0)
  }
  txns
    .filter((x) => x.status === 'SUCCESS' && x.createdAt)
    .forEach((x) => {
      const key = new Date(x.createdAt as string).toISOString().slice(0, 10)
      if (byDay.has(key)) {
        byDay.set(key, (byDay.get(key) ?? 0) + (Number(x.amount) || 0))
      }
    })
  return Array.from(byDay.entries()).map(([date, amount]) => ({
    date,
    label: new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    amount,
  }))
}

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [txns, setTxns] = useState<any[]>([])
  const [ledger, setLedger] = useState<any[]>([])
  const [rewardTxns, setRewardTxns] = useState<any[]>([])

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true
    if (silent) setRefreshing(true)
    else setLoading(true)
    try {
      const [t, l, r] = await Promise.allSettled([
        walletAPI.getTransactions(0, 100),
        walletAPI.getLedger(0, 100),
        rewardsAPI.getTransactions(0, 50),
      ])
      if (t.status === 'fulfilled') setTxns(t.value.data?.content || [])
      if (l.status === 'fulfilled') setLedger(l.value.data?.content || [])
      if (r.status === 'fulfilled') setRewardTxns(r.value.data?.content || [])
      setLastUpdated(Date.now())
    } finally {
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Live polling while tab is visible
  useEffect(() => {
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return
      load({ silent: true })
    }
    const id = setInterval(tick, POLL_MS)
    const onVis = () => {
      if (!document.hidden) load({ silent: true })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      if (id) clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [load])

  const totals = useMemo(() => {
    const credits = ledger.filter((x) => x.type === 'CREDIT').reduce((a, x) => a + (Number(x.amount) || 0), 0)
    const debits = ledger.filter((x) => x.type === 'DEBIT').reduce((a, x) => a + (Number(x.amount) || 0), 0)
    const successCount = txns.filter((x) => x.status === 'SUCCESS').length
    return { credits, debits, successCount }
  }, [ledger, txns])

  const txTypePie = useMemo(() => {
    return sumBy(txns, (x) => x.type || 'UNKNOWN', (x) => Number(x.amount) || 0).filter((x) => x.value > 0)
  }, [txns])

  const rewardTypePie = useMemo(() => {
    return sumBy(rewardTxns, (x) => x.type || 'UNKNOWN', (x) => Number(x.points) || 0).filter((x) => x.value > 0)
  }, [rewardTxns])

  const topOutflow = useMemo(() => {
    const out = txns
      .filter((x) => ['TRANSFER', 'WITHDRAW'].includes(x.type) && x.status === 'SUCCESS')
      .reduce((a, x) => a + (Number(x.amount) || 0), 0)
    const inflow = txns
      .filter((x) => ['TOPUP', 'CASHBACK', 'REDEEM'].includes(x.type) && x.status === 'SUCCESS')
      .reduce((a, x) => a + (Number(x.amount) || 0), 0)
    return { out, inflow }
  }, [txns])

  const barData = useMemo(() => {
    const rows = sumBy(txns.filter((x) => x.status === 'SUCCESS'), (x) => x.type || 'UNKNOWN', (x) => Number(x.amount) || 0)
    return rows.sort((a, b) => b.value - a.value).slice(0, 8).map((x) => ({ type: x.name, amount: x.value }))
  }, [txns])

  const dailySeries = useMemo(() => buildDailySeries(txns), [txns])

  const chartKey = lastUpdated ?? 0

  const tooltipStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    fontSize: 12,
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(22,179,110,0.15)', color: 'var(--brand)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Charts refresh every {POLL_MS / 1000}s while this tab is open
            {lastUpdated != null && (
              <span className="block text-xs mt-1 opacity-90">
                Last updated: {fmt.datetime(lastUpdated)}
                {refreshing && ' · refreshing…'}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load({ silent: !loading })}
          className="btn-ghost p-2 rounded-xl relative self-start sm:self-auto"
          title="Refresh now"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading || refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total credited" value={loading ? '—' : fmt.currency(totals.credits)} icon={<TrendingUp size={18} />} loading={loading} />
        <StatCard label="Total debited" value={loading ? '—' : fmt.currency(totals.debits)} icon={<TrendingDown size={18} />} loading={loading} />
        <StatCard label="Successful txns" value={loading ? '—' : fmt.number(totals.successCount)} icon={<BarChart3 size={18} />} loading={loading} />
        <StatCard label="Net (credit - debit)" value={loading ? '—' : fmt.currency(totals.credits - totals.debits)} icon={<TrendingUp size={18} />} loading={loading} />
      </div>

      {/* Live trend — last 7 days */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} style={{ color: 'var(--brand)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Activity (last 7 days)</p>
        </div>
        {loading ? (
          <Skeleton className="h-52 rounded-xl sm:h-56" />
        ) : dailySeries.every((d) => d.amount === 0) ? (
          <div className="h-52 flex items-center justify-center text-sm sm:h-56" style={{ color: 'var(--text-muted)' }}>
            No successful transactions in this window yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220} className="sm:!h-[260px]">
            <AreaChart data={dailySeries} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="liveArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16b36e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#16b36e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis width={44} tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v: number) => fmt.currency(v)} contentStyle={tooltipStyle} />
              <Area
                key={`area-${chartKey}`}
                type="monotone"
                dataKey="amount"
                stroke="var(--brand)"
                strokeWidth={2}
                fill="url(#liveArea)"
                isAnimationActive
                animationDuration={750}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-5">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Spend vs Receive (successful)</p>
          {loading ? (
            <Skeleton className="h-44 rounded-xl" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl p-4 transition-transform duration-200" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Outflow</p>
                <p className="break-words text-xl font-black text-red-400 tabular-nums sm:text-2xl">{fmt.currency(topOutflow.out)}</p>
              </div>
              <div className="rounded-2xl p-4 transition-transform duration-200" style={{ background: 'rgba(22,179,110,0.08)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Inflow</p>
                <p className="break-words text-xl font-black text-green-500 tabular-nums sm:text-2xl">{fmt.currency(topOutflow.inflow)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Transactions by type (amount)</p>
          {loading ? (
            <Skeleton className="h-44 rounded-xl" />
          ) : txTypePie.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  key={`pie-tx-${chartKey}`}
                  data={txTypePie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={72}
                  isAnimationActive
                  animationDuration={800}
                >
                  {txTypePie.map((_, i) => (
                    <Cell key={`${i}-${chartKey}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmt.currency(v)} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4 sm:p-5">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top transaction types (bar)</p>
          {loading ? (
            <Skeleton className="h-60 rounded-xl" />
          ) : barData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -24, bottom: 36 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="type" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} height={56} />
                <YAxis width={48} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => fmt.currency(v)} contentStyle={tooltipStyle} />
                <Bar
                  dataKey="amount"
                  fill="var(--brand)"
                  radius={[10, 10, 0, 0]}
                  isAnimationActive
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Rewards activity (points)</p>
          {loading ? (
            <Skeleton className="h-60 rounded-xl" />
          ) : rewardTypePie.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  key={`pie-rw-${chartKey}`}
                  data={rewardTypePie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={76}
                  isAnimationActive
                  animationDuration={800}
                >
                  {rewardTypePie.map((_, i) => (
                    <Cell key={`${i}-${chartKey}`} fill={COLORS[(i + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${fmt.number(v)} pts`} contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  )
}
