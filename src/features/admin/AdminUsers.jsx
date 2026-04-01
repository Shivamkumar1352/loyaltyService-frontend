import { useEffect, useState, useCallback } from 'react'
import { Search, UserX, UserCheck, Shield, RefreshCw, ChevronDown } from 'lucide-react'
import { adminAPI } from '../../core/api'
import { fmt, statusClass } from '../../shared/utils'
import { Badge, Pagination, Modal, Table } from '../../shared/components'
import toast from 'react-hot-toast'

const ROLES = ['USER', 'ADMIN', 'MERCHANT']
const KYC_STATUSES = ['APPROVED', 'PENDING', 'REJECTED', 'NOT_SUBMITTED']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState({ current: 0, total: 0 })
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: '', kycStatus: '' })
  const [selectedUser, setSelectedUser] = useState(null)
  const [roleModal, setRoleModal] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async (pageNum = 0) => {
    setLoading(true)
    try {
      let res
      if (search.trim()) {
        res = await adminAPI.searchUsers(search.trim(), pageNum)
      } else if (filters.kycStatus) {
        res = await adminAPI.searchByKyc(filters.kycStatus, pageNum)
      } else {
        res = await adminAPI.listUsers({ page: pageNum, size: 20, status: filters.status || undefined })
      }
      const data = res.data?.data || res.data
      setUsers(data?.content || [])
      setPage({ current: data?.number || 0, total: data?.totalPages || 0 })
    } finally { setLoading(false) }
  }, [search, filters])

  useEffect(() => {
    const t = setTimeout(() => load(0), 300)
    return () => clearTimeout(t)
  }, [load])

  const blockUser = async (userId) => {
    setActionLoading(true)
    try {
      await adminAPI.blockUser(userId)
      toast.success('User blocked')
      load(page.current)
    } catch { toast.error('Failed') }
    finally { setActionLoading(false) }
  }

  const unblockUser = async (userId) => {
    setActionLoading(true)
    try {
      await adminAPI.unblockUser(userId)
      toast.success('User unblocked')
      load(page.current)
    } catch { toast.error('Failed') }
    finally { setActionLoading(false) }
  }

  const changeRole = async () => {
    if (!newRole || !roleModal) return
    setActionLoading(true)
    try {
      await adminAPI.changeRole(roleModal.id, newRole)
      toast.success(`Role changed to ${newRole}`)
      setRoleModal(null)
      load(page.current)
    } catch { toast.error('Failed') }
    finally { setActionLoading(false) }
  }

  const columns = [
    { key: 'id',    label: 'ID',    render: (v) => <span className="font-mono text-xs">#{v}</span> },
    { key: 'name',  label: 'Name',  render: (v, row) => (
        <button onClick={() => setSelectedUser(row)} className="text-left hover:underline font-semibold text-sm"
          style={{ color: 'var(--brand)' }}>
          {v || '—'}
        </button>
      )
    },
    { key: 'email', label: 'Email', render: (v) => <span className="text-xs truncate">{v}</span> },
    { key: 'phone', label: 'Phone', render: (v) => <span className="text-xs font-mono">{v || '—'}</span> },
    { key: 'role',  label: 'Role',  render: (v) => <span className="badge badge-info text-xs">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    { key: 'kycStatus', label: 'KYC', render: (v) => <Badge status={v} label={v?.replace('_',' ')} /> },
    { key: 'id', label: 'Actions', render: (v, row) => (
        <div className="flex gap-1">
          {row.status === 'BLOCKED'
            ? <button onClick={() => unblockUser(v)} disabled={actionLoading}
                className="btn-ghost text-xs py-1 px-2 text-green-500">
                <UserCheck size={12} /> Unblock
              </button>
            : <button onClick={() => blockUser(v)} disabled={actionLoading}
                className="btn-ghost text-xs py-1 px-2 text-red-400">
                <UserX size={12} /> Block
              </button>
          }
          <button onClick={() => { setRoleModal(row); setNewRole(row.role) }}
            className="btn-ghost text-xs py-1 px-2">
            <Shield size={12} /> Role
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>User Management</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Search, filter, and manage all users</p>
        </div>
        <button onClick={() => load(page.current)} className="btn-ghost p-2 rounded-xl">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input className="input-field pl-9 py-2.5 text-sm" placeholder="Search name, email, phone…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field py-2.5 text-sm w-auto"
          value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {['ACTIVE','BLOCKED'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="input-field py-2.5 text-sm w-auto"
          value={filters.kycStatus} onChange={e => setFilters(f => ({ ...f, kycStatus: e.target.value }))}>
          <option value="">All KYC</option>
          {KYC_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
      </div>

      <Table columns={columns} data={users} loading={loading} emptyText="No users found" />
      <Pagination page={page.current} totalPages={page.total} onChange={load} />

      {/* User detail modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="lg">
        {selectedUser && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                {fmt.initials(selectedUser.name)}
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{selectedUser.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['User ID', `#${selectedUser.id}`],
                ['Phone', selectedUser.phone || '—'],
                ['Role', selectedUser.role],
                ['Status', selectedUser.status],
                ['KYC Status', selectedUser.kycStatus?.replace('_',' ')],
                ['Joined', fmt.date(selectedUser.createdAt)],
                ['Updated', fmt.date(selectedUser.updatedAt)],
              ].map(([k,v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{k}</p>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Role change modal */}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Change User Role">
        {roleModal && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Change role for <strong style={{ color: 'var(--text-primary)' }}>{roleModal.name}</strong>
            </p>
            <div>
              <label className="label">New Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(role => (
                  <button key={role} onClick={() => setNewRole(role)}
                    className="py-2 rounded-xl text-sm font-semibold transition-all"
                    style={newRole === role
                      ? { background: '#7c3aed', color: 'white' }
                      : { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    }>
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRoleModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={changeRole} disabled={actionLoading} className="btn-primary flex-1"
                style={{ background: '#7c3aed' }}>
                {actionLoading ? 'Saving…' : 'Change Role'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
