import { useEffect, useState } from 'react'
import { Users, ShieldCheck, UserCheck, UserX, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import { adminAPI } from '../../core/api'
import { fmt } from '../../shared/utils'
import { Skeleton, StatCard } from '../../shared/components'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#16b36e', '#3b82f6', '#f59e0b', '#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getDashboard()
      setStats(res.data?.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const kycData = stats ? [
    { name: 'Approved', value: stats.kycApproved },
    { name: 'Pending',  value: stats.kycPending },
    { name: 'Rejected', value: stats.kycRejected },
    { name: 'Not Submitted', value: stats.kycNotSubmitted },
  ].filter(d => d.value > 0) : []

  const userRoleData = stats ? [
    { name: 'Users',     value: stats.regularUsers },
    { name: 'Admins',    value: stats.adminUsers },
    { name: 'Merchants', value: stats.merchantUsers },
  ].filter(d => d.value > 0) : []

  const growthData = stats ? [
    { label: 'Today',     count: stats.newUsersToday },
    { label: 'This week', count: stats.newUsersThisWeek },
    { label: 'This month', count: stats.newUsersThisMonth },
  ] : []

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Platform overview and KPIs</p>
        </div>
        <button onClick={load} className="btn-ghost p-2 rounded-xl">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={loading ? '—' : fmt.number(stats?.totalUsers)} icon={<Users size={18} />} loading={loading} />
        <StatCard label="Active Users" value={loading ? '—' : fmt.number(stats?.activeUsers)} icon={<UserCheck size={18} />} loading={loading} />
        <StatCard label="Blocked Users" value={loading ? '—' : fmt.number(stats?.blockedUsers)} icon={<UserX size={18} />} loading={loading} />
        <StatCard label="KYC Pending" value={loading ? '—' : fmt.number(stats?.kycPending)} icon={<Clock size={18} />} loading={loading} />
      </div>

      {/* KYC Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          : [
              { label: 'KYC Approved', value: stats?.kycApproved, color: '#16b36e' },
              { label: 'KYC Pending',  value: stats?.kycPending,  color: '#f59e0b' },
              { label: 'KYC Rejected', value: stats?.kycRejected, color: '#ef4444' },
              { label: 'Not Submitted',value: stats?.kycNotSubmitted, color: '#9ca3af' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-2xl font-black" style={{ color }}>{fmt.number(value)}</p>
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* KYC Pie Chart */}
        <div className="card p-5">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>KYC Distribution</p>
          {loading
            ? <Skeleton className="h-48 rounded-xl" />
            : kycData.length === 0
            ? <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No data</div>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={kycData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {kycData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt.number(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* User Role Chart */}
        <div className="card p-5">
          <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>User Roles</p>
          {loading
            ? <Skeleton className="h-48 rounded-xl" />
            : userRoleData.length === 0
            ? <div className="h-48 flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>No data</div>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {userRoleData.map((_, i) => <Cell key={i} fill={['#16b36e','#8b5cf6','#3b82f6'][i % 3]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt.number(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Growth metrics */}
      <div className="card p-5">
        <p className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New User Growth</p>
        {loading
          ? <Skeleton className="h-40 rounded-xl" />
          : (
            <div className="grid grid-cols-3 gap-4">
              {growthData.map(({ label, count }) => (
                <div key={label} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-2xl font-black mb-1" style={{ color: 'var(--brand)' }}>{fmt.number(count)}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Today's KYC activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>KYC Approved Today</p>
          {loading ? <Skeleton className="h-8 w-16" /> : (
            <p className="text-3xl font-black text-green-500">{fmt.number(stats?.kycApprovedToday)}</p>
          )}
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>KYC Rejected Today</p>
          {loading ? <Skeleton className="h-8 w-16" /> : (
            <p className="text-3xl font-black text-red-500">{fmt.number(stats?.kycRejectedToday)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
