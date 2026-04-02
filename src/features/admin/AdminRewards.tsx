import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Pencil, Trash2, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { rewardsAdminAPI, adminAPI } from '../../core/api'
import { Skeleton, Modal, Table } from '../../shared/components'

const TYPES = ['CASHBACK', 'COUPON', 'VOUCHER']
const TIERS = ['', 'SILVER', 'GOLD', 'PLATINUM']

function unwrapPayload(res: any) {
  const d = res?.data?.data ?? res?.data ?? res
  return d
}

export default function AdminRewards() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])
  const [edit, setEdit] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [addingOpen, setAddingOpen] = useState(false)
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
      const res = await rewardsAdminAPI.getCatalog()
      const data = unwrapPayload(res)
      setItems(Array.isArray(data) ? data : data?.data || data?.content || [])
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
    { key: 'stock', label: 'Stock', render: (v: any) => <span className="text-xs">{v ?? '∞'}</span> },
    { key: 'tierRequired', label: 'Tier', render: (v: any) => <span className="text-xs">{v || 'All'}</span> },
    { key: 'active', label: 'Active', render: (v: any) => <span className={`badge text-xs ${v ? 'badge-success' : 'badge-danger'}`}>{v ? 'Yes' : 'No'}</span> },
    {
      key: 'id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-1">
          <button onClick={() => setEdit(row)} className="btn-ghost text-xs py-1 px-2">
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={async () => {
              if (!confirm(`Delete reward "${row.name}"?`)) return
              try {
                await rewardsAdminAPI.deleteItem(row.id)
                toast.success('Deleted')
                load()
              } catch {
                toast.error('Failed to delete')
              }
            }}
            className="btn-ghost text-xs py-1 px-2 text-red-400"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      ),
    },
  ]), [])

  const saveEdit = async () => {
    if (!edit?.id) return
    setSaving(true)
    try {
      await rewardsAdminAPI.updateItem(edit.id, {
        name: edit.name,
        description: edit.description,
        pointsRequired: Number(edit.pointsRequired),
        type: edit.type,
        stock: edit.stock === '' || edit.stock === null ? undefined : Number(edit.stock),
        tierRequired: edit.tierRequired || undefined,
        active: Boolean(edit.active),
      })
      toast.success('Updated')
      setEdit(null)
      load()
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

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
      setAddingOpen(false)
      setRewardForm({
        name: '',
        description: '',
        type: 'CASHBACK',
        pointsRequired: '',
        stock: '',
        tierRequired: '',
        active: true,
      })
      load()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add reward item')
    } finally {
      setAddingReward(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Rewards Catalog</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage catalog items (create, update, delete)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddingOpen(true)} className="btn-secondary text-sm">
            <Plus size={14} /> Add
          </button>
          <button onClick={load} className="btn-ghost p-2 rounded-xl" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <Table columns={columns as any} data={items} loading={loading} emptyText="No catalog items" />
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Reward Item" size="lg">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <select className="input-field" value={edit.type || 'CASHBACK'} onChange={(e) => setEdit((p: any) => ({ ...p, type: e.target.value }))}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Points Required</label>
                <input className="input-field" type="number" min="1" value={edit.pointsRequired ?? ''} onChange={(e) => setEdit((p: any) => ({ ...p, pointsRequired: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
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
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={Boolean(edit.active)} onChange={(e) => setEdit((p: any) => ({ ...p, active: e.target.checked }))} />
              Active
            </label>
            <div className="flex gap-3">
              <button onClick={() => setEdit(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={addingOpen} onClose={() => setAddingOpen(false)} title="Add Reward Item">
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
              <select className="input-field" value={rewardForm.type} onChange={(e) => setRewardForm((prev) => ({ ...prev, type: e.target.value }))}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Points Required</label>
              <input className="input-field" type="number" min="1" value={rewardForm.pointsRequired} onChange={(e) => setRewardForm((prev) => ({ ...prev, pointsRequired: e.target.value }))} placeholder="100" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stock</label>
              <input className="input-field" type="number" min="0" value={rewardForm.stock} onChange={(e) => setRewardForm((prev) => ({ ...prev, stock: e.target.value }))} placeholder="Leave blank for unlimited" />
            </div>
            <div>
              <label className="label">Tier Required</label>
              <select className="input-field" value={rewardForm.tierRequired} onChange={(e) => setRewardForm((prev) => ({ ...prev, tierRequired: e.target.value }))}>
                {TIERS.map((t) => <option key={t || 'ALL'} value={t}>{t || 'All tiers'}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={rewardForm.active} onChange={(e) => setRewardForm((prev) => ({ ...prev, active: e.target.checked }))} />
            Active reward item
          </label>
          <div className="flex gap-3">
            <button onClick={() => setAddingOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={addRewardItem} disabled={addingReward} className="btn-primary flex-1">
              {addingReward ? 'Saving…' : <><Gift size={14} /> Add Reward</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

