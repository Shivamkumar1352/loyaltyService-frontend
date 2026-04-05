import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Eye, RefreshCw, ShieldCheck } from 'lucide-react'
import { adminAPI } from '../../core/api'
import { fmt } from '../../shared/utils'
import { Pagination, Modal, Skeleton } from '../../shared/components'
import toast from 'react-hot-toast'

export default function AdminKyc() {
  const [pendingKyc, setPendingKyc] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState({ current: 0, total: 0 })
  const [viewModal, setViewModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async (pageNum = 0) => {
    setLoading(true)
    try {
      const res = await adminAPI.getPendingKyc(pageNum)
      const data = res.data
      // API returns object directly or wrapped
      const content = data?.content || data?.data?.content || []
      const totalPages = data?.totalPages || data?.data?.totalPages || 0
      setPendingKyc(content)
      setPage({ current: pageNum, total: totalPages })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const approve = async (kycId) => {
    setActionLoading(true)
    try {
      await adminAPI.approveKyc(kycId)
      toast.success('KYC approved!')
      setViewModal(null)
      load(page.current)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setActionLoading(false) }
  }

  const reject = async (kycId) => {
    if (!rejectReason.trim()) return toast.error('Please provide a reason')
    setActionLoading(true)
    try {
      await adminAPI.rejectKyc(kycId, rejectReason)
      toast.success('KYC rejected')
      setRejectModal(null)
      setRejectReason('')
      load(page.current)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setActionLoading(false) }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>KYC Review Queue</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Review and approve pending KYC submissions
            {!loading && <span className="ml-2 badge badge-warning">{pendingKyc.length} pending</span>}
          </p>
        </div>
        <button
          onClick={() => load(page.current)}
          className="btn-ghost p-2 rounded-xl"
          title="Refresh KYC queue"
          aria-label="Refresh KYC queue"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      ) : pendingKyc.length === 0 ? (
        <div className="card p-16 text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold" style={{ color: 'var(--text-primary)' }}>No pending KYC submissions</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>All submissions have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingKyc.map((kyc) => (
            <div key={kyc.kycId || kyc.id} className="card p-4 flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                {fmt.initials(kyc.userName || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {kyc.userName || `User #${kyc.userId}`}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {kyc.userEmail} · {kyc.docType} · {kyc.docNumber}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Submitted: {fmt.datetime(kyc.submittedAt)}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setViewModal(kyc)} className="btn-ghost text-xs px-3 py-1.5">
                  <Eye size={12} /> View
                </button>
                <button onClick={() => approve(kyc.kycId || kyc.id)} disabled={actionLoading}
                  className="btn-ghost text-xs px-3 py-1.5 text-green-500">
                  <CheckCircle size={12} /> Approve
                </button>
                <button onClick={() => { setRejectModal(kyc); setRejectReason('') }} disabled={actionLoading}
                  className="btn-ghost text-xs px-3 py-1.5 text-red-400">
                  <XCircle size={12} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page.current} totalPages={page.total} onChange={load} />

      {/* View KYC Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="KYC Submission Details" size="lg">
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['KYC ID', `#${viewModal.kycId || viewModal.id}`],
                ['User', viewModal.userName],
                ['Email', viewModal.userEmail],
                ['User ID', `#${viewModal.userId}`],
                ['Document Type', viewModal.docType],
                ['Document Number', viewModal.docNumber],
                ['Submitted', fmt.datetime(viewModal.submittedAt)],
                ['Status', viewModal.status],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{k}</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{v || '—'}</p>
                </div>
              ))}
            </div>
            {viewModal.docFilePath && (
              <div>
                <p className="label">Document File</p>
                <a href={viewModal.docFilePath} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-sm w-full">
                  View Document
                </a>
              </div>
            )}
            <div className="flex gap-3 mt-2">
              <button onClick={() => { setRejectModal(viewModal); setViewModal(null) }}
                className="btn-secondary flex-1 text-red-400">
                <XCircle size={14} /> Reject
              </button>
              <button onClick={() => approve(viewModal.kycId || viewModal.id)} disabled={actionLoading}
                className="btn-primary flex-1">
                <CheckCircle size={14} /> {actionLoading ? 'Approving…' : 'Approve'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject KYC Submission">
        {rejectModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {rejectModal.userName} — {rejectModal.docType}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rejectModal.docNumber}</p>
            </div>
            <div>
              <label className="label">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea className="input-field resize-none h-24"
                placeholder="e.g. Document unclear, information mismatch…"
                value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => reject(rejectModal.kycId || rejectModal.id)} disabled={actionLoading || !rejectReason.trim()}
                className="btn-primary flex-1 bg-red-500 hover:bg-red-600" style={{ background: '#ef4444' }}>
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
