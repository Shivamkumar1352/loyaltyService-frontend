import { useEffect, useState, useCallback } from 'react'
import { Download, Filter, FileText, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { walletAPI } from '../../core/api'
import { fmt, statusClass } from '../../shared/utils'
import { Badge, Pagination, Table, Modal } from '../../shared/components'
import toast from 'react-hot-toast'

const TX_TYPE_COLORS = {
  TOPUP: 'text-green-500', CASHBACK: 'text-green-400', REDEEM: 'text-blue-400',
  TRANSFER: 'text-red-400', WITHDRAW: 'text-orange-400',
}

export default function Transactions() {
  const [tab, setTab] = useState('txns') // 'txns' | 'ledger'
  const [txns, setTxns] = useState([])
  const [ledger, setLedger] = useState([])
  const [txPage, setTxPage] = useState({ current: 0, total: 0 })
  const [ledgerPage, setLedgerPage] = useState({ current: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', status: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [statementDates, setStatementDates] = useState({ from: '', to: '' })
  const [showStatement, setShowStatement] = useState(false)
  const [disputeModal, setDisputeModal] = useState(null)

  const loadTxns = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const res = await walletAPI.getTransactions(page, 10)
      const data = res.data
      let content = data.content || []
      if (filters.type) content = content.filter(t => t.type === filters.type)
      if (filters.status) content = content.filter(t => t.status === filters.status)
      setTxns(content)
      setTxPage({ current: data.number || 0, total: data.totalPages || 0 })
    } finally { setLoading(false) }
  }, [filters])

  const loadLedger = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const res = await walletAPI.getLedger(page, 20)
      const data = res.data
      setLedger(data.content || [])
      setLedgerPage({ current: data.number || 0, total: data.totalPages || 0 })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { tab === 'txns' ? loadTxns() : loadLedger() }, [tab, loadTxns, loadLedger])

  const downloadStatement = async () => {
    if (!statementDates.from || !statementDates.to) return toast.error('Select date range')
    try {
      const res = await walletAPI.downloadStatement(statementDates.from, statementDates.to)
      const blob = new Blob([res.data])
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'statement.csv'; a.click()
      toast.success('Statement downloaded')
      setShowStatement(false)
    } catch { toast.error('Failed to download') }
  }

  const txnColumns = [
    { key: 'type', label: 'Type', render: (v) => (
        <div className="flex items-center gap-2">
          <span className={`text-xs ${['TOPUP','CASHBACK','REDEEM'].includes(v) ? '' : ''}`}>
            {['TOPUP','CASHBACK','REDEEM'].includes(v)
              ? <ArrowDownLeft size={13} className="text-green-500" />
              : <ArrowUpRight size={13} className="text-red-400" />
            }
          </span>
          <span className={`text-xs font-semibold ${TX_TYPE_COLORS[v] || ''}`}>{v}</span>
        </div>
      )
    },
    { key: 'amount', label: 'Amount', render: (v, row) => (
        <span className={`font-bold text-sm ${['TOPUP','CASHBACK','REDEEM'].includes(row.type) ? 'text-green-500' : 'text-red-400'}`}>
          {['TOPUP','CASHBACK','REDEEM'].includes(row.type) ? '+' : '−'}{fmt.currency(v)}
        </span>
      )
    },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-xs truncate max-w-[140px] block">{v || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => <span className="text-xs whitespace-nowrap">{fmt.datetime(v)}</span> },
    { key: 'id', label: '', render: (v, row) => (
        row.status === 'FAILED' || row.status === 'REVERSED'
          ? <button onClick={() => setDisputeModal(row)} className="btn-ghost text-xs px-2 py-1 text-orange-500">
              <AlertTriangle size={12} /> Dispute
            </button>
          : null
      )
    },
  ]

  const ledgerColumns = [
    { key: 'type', label: 'Type', render: (v) => (
        <span className={`badge ${v === 'CREDIT' ? 'badge-success' : 'badge-danger'}`}>{v}</span>
      )
    },
    { key: 'amount', label: 'Amount', render: (v, row) => (
        <span className={`font-bold text-sm ${row.type === 'CREDIT' ? 'text-green-500' : 'text-red-400'}`}>
          {row.type === 'CREDIT' ? '+' : '−'}{fmt.currency(v)}
        </span>
      )
    },
    { key: 'description', label: 'Description', render: (v) => <span className="text-xs">{v || '—'}</span> },
    { key: 'referenceId', label: 'Reference', render: (v) => <span className="text-xs font-mono">{v || '—'}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => <span className="text-xs whitespace-nowrap">{fmt.datetime(v)}</span> },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Transaction History</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All your wallet activity in one place</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary text-sm">
            <Filter size={14} /> Filters
          </button>
          <button onClick={() => setShowStatement(true)} className="btn-secondary text-sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4 animate-slide-up">
          <div>
            <label className="label">Type</label>
            <select className="input-field py-2 text-sm"
              value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
              <option value="">All Types</option>
              {['TOPUP','TRANSFER','WITHDRAW','CASHBACK','REDEEM'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input-field py-2 text-sm"
              value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              {['PENDING','SUCCESS','FAILED','REVERSED'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilters({ type: '', status: '' }); setShowFilters(false) }}
              className="btn-ghost text-sm">Clear</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        {[['txns', 'Transactions'], ['ledger', 'Ledger']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === val
              ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }>
            {label}
          </button>
        ))}
      </div>

      {tab === 'txns' && (
        <>
          <Table columns={txnColumns} data={txns} loading={loading} emptyText="No transactions found" />
          <Pagination page={txPage.current} totalPages={txPage.total} onChange={(p) => loadTxns(p)} />
        </>
      )}

      {tab === 'ledger' && (
        <>
          <Table columns={ledgerColumns} data={ledger} loading={loading} emptyText="No ledger entries found" />
          <Pagination page={ledgerPage.current} totalPages={ledgerPage.total} onChange={(p) => loadLedger(p)} />
        </>
      )}

      {/* Export modal */}
      <Modal open={showStatement} onClose={() => setShowStatement(false)} title="Export Statement">
        <div className="space-y-4">
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input-field"
              value={statementDates.from} onChange={e => setStatementDates(d => ({ ...d, from: e.target.value }))} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input-field"
              value={statementDates.to} onChange={e => setStatementDates(d => ({ ...d, to: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowStatement(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={downloadStatement} className="btn-primary flex-1">
              <FileText size={14} /> Download CSV
            </button>
          </div>
        </div>
      </Modal>

      {/* Dispute modal */}
      <Modal open={!!disputeModal} onClose={() => setDisputeModal(null)} title="Raise Dispute">
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Transaction #{disputeModal?.id}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {disputeModal?.type} · {fmt.currency(disputeModal?.amount)} · <Badge status={disputeModal?.status} />
            </p>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea className="input-field resize-none h-24" placeholder="Describe your issue…" />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Our support team will review your dispute within 2–3 business days.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDisputeModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => { toast.success('Dispute raised! We\'ll reach out soon.'); setDisputeModal(null) }} className="btn-primary flex-1">
              Submit Dispute
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
