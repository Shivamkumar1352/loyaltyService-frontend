import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Pencil, Trash2, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { rewardsAdminAPI, adminAPI } from '../../core/api'
import { Skeleton, Modal, Table } from '../../shared/components'

const TYPES = ['CASHBACK', 'COUPON', 'VOUCHER']
const TIERS = ['', 'SILVER', 'GOLD', 'PLATINUM']
const EMPTY_REWARD_FORM = {
  name: '',
  description: '',
  type: 'CASHBACK',
  pointsRequired: '',
  stock: '',
  tierRequired: '',
  cashbackAmount: '',
}

function unwrapPayload(res: any) {
  return res?.data?.data ?? res?.data ?? res
}

export default function AdminRewards() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [edit, setEdit] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [addingOpen, setAddingOpen] = useState(false)
  const [addingReward, setAddingReward] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [rewardForm, setRewardForm] = useState(EMPTY_REWARD_FORM)

  const load = async () => {
    setLoading(true)
    try {
      const res = await rewardsAdminAPI.getCatalog()
      const data = unwrapPayload(res)
      setItems(Array.isArray(data) ? data : data?.content || [])
    } catch {
      toast.error('Failed to load reward catalog')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const columns = useMemo(() => ([
    { key: 'id', label: 'ID', render: (v: any) => <span className="font-mono text-xs">#{v}</span> },
    { key: 'name', label: 'Name', render: (v: any) => <span className="font-semibold text-sm">{v}</span> },
    { key: 'type', label: 'Type', render: (v: any) => <span className="badge badge-info text-xs">{v}</span> },
    { key: 'pointsRequired', label: 'Points', render: (v: any) => <span className="font-black" style={{ color: 'var(--brand)' }}>{v}</span> },
    {
      key: 'cashbackAmount',
      label: 'Cashback',
      render: (v: any, row: any) => row.type === 'CASHBACK'
        ? <span className="font-bold text-green-500">₹{v}</span>
        : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    { key: 'stock', label: 'Stock', render: (v: any) => <span>{v ?? '∞'}</span> },
    { key: 'tierRequired', label: 'Tier', render: (v: any) => <span>{v || 'All'}</span> },
    { key: 'active', label: 'Active', render: (v: any) => <span className={v ? 'text-green-500' : 'text-red-400'}>{v ? 'Yes' : 'No'}</span> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-1">
          <button onClick={() => setEdit(row)} className="btn-ghost text-xs">
            <Pencil size={12} /> Edit
          </button>
          <button onClick={() => setDeleteTarget(row)} className="btn-ghost text-xs text-red-400">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      ),
    },
  ]), [])

  const addRewardItem = async () => {
    if (!rewardForm.name.trim() || !rewardForm.description.trim() || !rewardForm.pointsRequired) {
      return toast.error('Name, description, and points are required')
    }

    if (rewardForm.type === 'CASHBACK' && !rewardForm.cashbackAmount) {
      return toast.error('Cashback amount required')
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
        cashbackAmount: rewardForm.type === 'CASHBACK' ? Number(rewardForm.cashbackAmount) : undefined,
      })
      toast.success('Reward added')
      setAddingOpen(false)
      setRewardForm(EMPTY_REWARD_FORM)
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add reward')
    } finally {
      setAddingReward(false)
    }
  }

  const saveEdit = async () => {
    if (!edit?.id) return
    setSaving(true)
    try {
      await rewardsAdminAPI.updateItem(edit.id, {
        ...edit,
        pointsRequired: Number(edit.pointsRequired),
        stock: edit.stock === '' || edit.stock === null ? undefined : Number(edit.stock),
        tierRequired: edit.tierRequired || undefined,
        cashbackAmount: edit.type === 'CASHBACK' ? Number(edit.cashbackAmount) : undefined,
      })
      toast.success('Updated')
      setEdit(null)
      load()
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return
    setDeleting(true)
    try {
      await rewardsAdminAPI.deleteItem(deleteTarget.id)
      toast.success('Deleted')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Failed to delete reward')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Rewards Catalog</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Create rewards with the same fields expected by the reward service add request.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost p-2 rounded-xl" title="Refresh reward catalog" aria-label="Refresh reward catalog">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setAddingOpen(true)} className="btn-primary">
            <Plus size={14} /> Add Reward
          </button>
        </div>
      </div>

      {loading ? <Skeleton className="h-64" /> : <Table columns={columns as any} data={items} />}

      <Modal open={addingOpen} onClose={() => setAddingOpen(false)} title="Add Reward" size="lg">
        <div className="space-y-5">
          {/*<div className="rounded-2xl p-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>*/}
          {/*  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Backend-aligned form</p>*/}
          {/*  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>*/}
          {/*    Sends `name`, `description`, `pointsRequired`, `type`, `stock`, `tierRequired`, and `cashbackAmount`.*/}
          {/*  </p>*/}
          {/*</div>*/}

          <div>
            <label className="label">Reward Name</label>
            <input
              className="input-field"
              placeholder="Weekend cashback drop"
              value={rewardForm.name}
              onChange={(e) => setRewardForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field resize-none h-24"
              placeholder="Short explanation shown in the rewards catalog"
              value={rewardForm.description}
              onChange={(e) => setRewardForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Reward Type</label>
              <select
                className="input-field"
                value={rewardForm.type}
                onChange={(e) => setRewardForm((p) => ({
                  ...p,
                  type: e.target.value,
                  cashbackAmount: e.target.value === 'CASHBACK' ? p.cashbackAmount : '',
                }))}
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Points Required</label>
              <input
                type="number"
                min="1"
                className="input-field"
                placeholder="100"
                value={rewardForm.pointsRequired}
                onChange={(e) => setRewardForm((p) => ({ ...p, pointsRequired: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Stock</label>
              <input
                type="number"
                min="0"
                className="input-field"
                placeholder="Leave blank for unlimited"
                value={rewardForm.stock}
                onChange={(e) => setRewardForm((p) => ({ ...p, stock: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Tier Required</label>
              <select
                className="input-field"
                value={rewardForm.tierRequired}
                onChange={(e) => setRewardForm((p) => ({ ...p, tierRequired: e.target.value }))}
              >
                {TIERS.map((t) => <option key={t || 'ALL'} value={t}>{t || 'All tiers'}</option>)}
              </select>
            </div>
          </div>

          {rewardForm.type === 'CASHBACK' && (
            <div>
              <label className="label">Cashback Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="input-field"
                placeholder="50"
                value={rewardForm.cashbackAmount}
                onChange={(e) => setRewardForm((p) => ({ ...p, cashbackAmount: e.target.value }))}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Only required for `CASHBACK` rewards.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setAddingOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={addRewardItem} disabled={addingReward} className="btn-primary">
              {addingReward ? 'Adding...' : <><Gift size={14} /> Add Reward</>}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Reward" size="lg">
        {edit && (
          <div className="space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input-field" value={edit.name || ''} onChange={(e) => setEdit((p: any) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input-field resize-none h-24" value={edit.description || ''} onChange={(e) => setEdit((p: any) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={edit.type || 'CASHBACK'} onChange={(e) => setEdit((p: any) => ({ ...p, type: e.target.value, cashbackAmount: e.target.value === 'CASHBACK' ? p.cashbackAmount : '' }))}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Points Required</label>
                <input className="input-field" type="number" min="1" value={edit.pointsRequired ?? ''} onChange={(e) => setEdit((p: any) => ({ ...p, pointsRequired: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Stock</label>
                <input className="input-field" type="number" min="0" value={edit.stock ?? ''} onChange={(e) => setEdit((p: any) => ({ ...p, stock: e.target.value }))} placeholder="Blank = unlimited" />
              </div>
              <div>
                <label className="label">Tier Required</label>
                <select className="input-field" value={edit.tierRequired || ''} onChange={(e) => setEdit((p: any) => ({ ...p, tierRequired: e.target.value }))}>
                  {TIERS.map((t) => <option key={t || 'ALL'} value={t}>{t || 'All tiers'}</option>)}
                </select>
              </div>
            </div>
            {edit.type === 'CASHBACK' && (
              <div>
                <label className="label">Cashback Amount</label>
                <input className="input-field" type="number" min="1" step="0.01" value={edit.cashbackAmount || ''} onChange={(e) => setEdit((p: any) => ({ ...p, cashbackAmount: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setEdit(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} title="Delete Reward" size="sm">
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              This will permanently delete <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{deleteTarget.name}</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary" disabled={deleting}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-primary" disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
