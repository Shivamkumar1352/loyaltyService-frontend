import { useEffect, useState } from 'react'
import { Users, UserCheck, UserX, Clock, RefreshCw, Gift } from 'lucide-react'
import { adminAPI } from '../../core/api'
import { fmt } from '../../shared/utils'
import { Skeleton, StatCard, Modal } from '../../shared/components'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import toast from 'react-hot-toast'

const COLORS = ['#16b36e', '#3b82f6', '#f59e0b', '#ef4444']
const REWARD_TYPES = ['CASHBACK', 'COUPON', 'VOUCHER']
const REWARD_TIERS = ['', 'SILVER', 'GOLD', 'PLATINUM']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addRewardOpen, setAddRewardOpen] = useState(false)
  const [addingReward, setAddingReward] = useState(false)
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    type: 'CASHBACK',
    pointsRequired: '',
    stock: '',
    tierRequired: '',
    active: true,
  })

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getDashboard()
      setStats(res.data?.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const addRewardItem = async () => {
    if (!rewardForm.name.trim() || !rewardForm.description.trim() || !rewardForm.pointsRequired) {
      toast.error('Fill the required reward fields')
      return
    }
    setAddingReward(true)
    try {
      await adminAPI.addRewardItem({
        name: rewardForm.name.trim(),
        description: rewardForm.description.trim(),
        type: rewardForm.type,
        pointsRequired: Number(rewardForm.pointsRequired),
        stock: rewardForm.stock ? Number(rewardForm.stock) : undefined,
        tierRequired: rewardForm.tierRequired || undefined,
        active: rewardForm.active,
      })
      toast.success('Reward item added')
      setAddRewardOpen(false)
      setRewardForm({
        name: '',
        description: '',
        type: 'CASHBACK',
        pointsRequired: '',
        stock: '',
        tierRequired: '',
        active: true,
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add reward item')
    } finally {
      setAddingReward(false)
    }
  }

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
        <div className="flex gap-2">
          <button onClick={() => setAddRewardOpen(true)} className="btn-secondary text-sm">
            <Gift size={14} /> Add Reward
          </button>
          <button onClick={load} className="btn-ghost p-2 rounded-xl">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
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

      <Modal open={addRewardOpen} onClose={() => setAddRewardOpen(false)} title="Add Reward Item">
        <div className="space-y-4">
          <div>
            <label className="label">Reward Name</label>
            <input
              className="input-field"
              value={rewardForm.name}
              onChange={(e) => setRewardForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Weekend cashback"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field resize-none h-24"
              value={rewardForm.description}
              onChange={(e) => setRewardForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Visible in the rewards catalog"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select
                className="input-field"
                value={rewardForm.type}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, type: e.target.value }))}
              >
                {REWARD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Points Required</label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={rewardForm.pointsRequired}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, pointsRequired: e.target.value }))}
                placeholder="100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stock</label>
              <input
                className="input-field"
                type="number"
                min="0"
                value={rewardForm.stock}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, stock: e.target.value }))}
                placeholder="Leave blank for unlimited"
              />
            </div>
            <div>
              <label className="label">Tier Required</label>
              <select
                className="input-field"
                value={rewardForm.tierRequired}
                onChange={(e) => setRewardForm((prev) => ({ ...prev, tierRequired: e.target.value }))}
              >
                {REWARD_TIERS.map((tier) => <option key={tier || 'ALL'} value={tier}>{tier || 'All tiers'}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={rewardForm.active}
              onChange={(e) => setRewardForm((prev) => ({ ...prev, active: e.target.checked }))}
            />
            Active reward item
          </label>
          <div className="flex gap-3">
            <button onClick={() => setAddRewardOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={addRewardItem} disabled={addingReward} className="btn-primary flex-1">
              {addingReward ? 'Saving…' : 'Add Reward'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
