import { useEffect, useState } from 'react'
import { Gift, Star, Tag, Zap, CheckCircle } from 'lucide-react'
import { rewardsAPI } from '../../core/api'
import { fmt } from '../../shared/utils'
import { Skeleton, Modal, Badge } from '../../shared/components'
import toast from 'react-hot-toast'

const TIER_CONFIG = {
  SILVER:   { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', label: '🥈 Silver' },
  GOLD:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: '🥇 Gold' },
  PLATINUM: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  label: '💎 Platinum' },
}

const ITEM_ICONS = { CASHBACK: <Zap size={18} />, COUPON: <Tag size={18} />, VOUCHER: <Gift size={18} /> }

export default function Rewards() {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [summary, setSummary] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)
  const [redeemModal, setRedeemModal] = useState(null)
  const [pointsModal, setPointsModal] = useState(false)
  const [redeemPoints, setRedeemPoints] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [tab, setTab] = useState('catalog')

  const load = async (pageNumber = 0) => {
    setLoading(true)
    try {
      const [s, c, t] = await Promise.allSettled([
        rewardsAPI.getSummary(),
        rewardsAPI.getCatalog(),
        rewardsAPI.getTransactions(pageNumber, size),
      ])

      if (s.status === 'fulfilled') setSummary(s.value.data?.data)
      if (c.status === 'fulfilled') setCatalog(c.value.data?.data || [])

      if (t.status === 'fulfilled') {
        const response = t.value.data
        setTxns(response?.content || [])
        setTotalPages(response?.totalPages || 0)
      }

    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    load(page)
  }, [page, size]) 

  const handleRedeem = async () => {
    if (!redeemModal) return
    setRedeeming(true)
    try {
      await rewardsAPI.redeem({ rewardId: redeemModal.id })
      toast.success(`Redeemed: ${redeemModal.name}!`)
      setRedeemModal(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Redemption failed')
    } finally { setRedeeming(false) }
  }

  const handleRedeemPoints = async () => {
    if (!redeemPoints || Number(redeemPoints) < 1) {
      toast.error('Please enter valid points amount')
      return
    }
    
    if (Number(redeemPoints) > (summary?.points || 0)) {
      toast.error('Insufficient points balance')
      return
    }
    
    setRedeeming(true)
    try {
      await rewardsAPI.redeemPoints(Number(redeemPoints))
      toast.success(`${redeemPoints} points redeemed as ₹${redeemPoints} wallet credit!`)
      setPointsModal(false)
      setRedeemPoints('')
      load()
    } catch (err) {
      console.error('Redeem points error:', err)
      toast.error(err.response?.data?.message || 'Redemption failed')
    } finally { 
      setRedeeming(false)
    }
  }

  const tier = TIER_CONFIG[summary?.tier] || TIER_CONFIG.SILVER
  const progress = summary ? Math.min(100, (summary.points / (summary.points + summary.pointsToNextTier)) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Rewards & Loyalty</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Earn points on every transaction</p>
      </div>

      {/* Summary card */}
      <div className="card p-6 relative overflow-hidden">
        {/* FIX: Added pointer-events-none so the decorative overlay doesn't block button clicks */}
        <div className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: `radial-gradient(circle at 90% 10%, ${tier.color}30, transparent 60%)` }} />
        <div className="relative flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Points Balance</p>
            {loading
              ? <Skeleton className="h-10 w-32" />
              : <p className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {fmt.number(summary?.points ?? 0)}
                </p>
            }
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>1 point = ₹1</p>
          </div>
          {!loading && summary && (
            <div className="px-3 py-1.5 rounded-xl font-bold text-sm" style={{ background: tier.bg, color: tier.color }}>
              {tier.label}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {!loading && summary && (
          <div>
            <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <span>{summary.tier}</span>
              <span>{fmt.number(summary.pointsToNextTier)} pts to {summary.nextTier}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${tier.color}, var(--brand))` }} />
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button 
            onClick={() => setPointsModal(true)}
            className="btn-primary text-sm px-4 py-2"
          >
            <Zap size={14} /> Convert Points
          </button>
        </div>
      </div>

      {/* Earn rules banner */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(22,179,110,0.08), rgba(59,130,246,0.08))', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(22,179,110,0.12)' }}>
          <Star size={20} style={{ color: 'var(--brand)' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>How to earn points</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Earn 1 point per ₹10 top-up · 2x on campaigns · Bonus on tier upgrade
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        {[['catalog', 'Rewards Catalog'], ['history', 'History']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all`}
            style={tab === val
              ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Catalog */}
      {tab === 'catalog' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
            : catalog.length === 0
            ? <div className="col-span-2 text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
                No rewards available yet
              </div>
            : catalog.map((item) => {
                const canRedeem = (summary?.points ?? 0) >= item.pointsRequired && item.active && item.stock > 0
                return (
                  <div key={item.id} className={`card p-5 transition-all duration-200 ${canRedeem ? 'hover:scale-[1.01]' : 'opacity-60'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(22,179,110,0.1)', color: 'var(--brand)' }}>
                        {ITEM_ICONS[item.type] || <Gift size={18} />}
                      </div>
                      <span className="badge badge-info text-xs">{item.type}</span>
                    </div>
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black" style={{ color: 'var(--brand)' }}>
                          {fmt.number(item.pointsRequired)} pts
                        </span>
                        {item.tierRequired && (
                          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                            · {item.tierRequired}+
                          </span>
                        )}
                      </div>
                      <button onClick={() => setRedeemModal(item)} disabled={!canRedeem}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${canRedeem ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}>
                        Redeem
                      </button>
                    </div>
                    {item.stock > 0 && item.stock < 10 && (
                      <p className="text-xs mt-2 text-orange-500">Only {item.stock} left!</p>
                    )}
                  </div>
                )
              })
          }
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="card divide-y" style={{ '--tw-divide-opacity': 1 }}>
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-20" /></div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            : txns.length === 0
            ? <div className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>No reward transactions yet</div>
            : (
                <>
                  {txns.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tx.type === 'EARN' || tx.type === 'BONUS' ? 'rgba(22,179,110,0.1)' : 'rgba(239,68,68,0.1)' }}>
                        <Star size={14} style={{ color: tx.type === 'EARN' || tx.type === 'BONUS' ? 'var(--brand)' : '#ef4444' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{tx.description || tx.type}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt.datetime(tx.createdAt)}</p>
                      </div>
                      <span className={`text-sm font-bold ${['EARN','BONUS'].includes(tx.type) ? 'text-green-500' : 'text-red-400'}`}>
                        {['EARN','BONUS'].includes(tx.type) ? '+' : '−'}{fmt.number(tx.points)} pts
                      </span>
                    </div>
                  ))}
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={() => setPage(prev => Math.max(prev - 1, 0))}
                        disabled={page === 0 || loading}
                        className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ← Previous
                      </button>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Page {page + 1} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1 || loading}
                        className="btn-secondary px-4 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )
          }
        </div>
      )}

      {/* Redeem catalog item modal */}
      <Modal open={!!redeemModal} onClose={() => setRedeemModal(null)} title="Confirm Redemption">
        {redeemModal && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-tertiary)' }}>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>{redeemModal.name}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{redeemModal.description}</p>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Points required</span>
              <span className="font-bold" style={{ color: 'var(--brand)' }}>{fmt.number(redeemModal.pointsRequired)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-muted)' }}>Your balance</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{fmt.number(summary?.points)}</span>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setRedeemModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleRedeem} disabled={redeeming} className="btn-primary flex-1">
                {redeeming ? 'Redeeming…' : 'Confirm Redeem'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Convert points modal */}
      <Modal open={pointsModal} onClose={() => setPointsModal(false)} title="Convert Points to Cash">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            1 point = ₹1. Daily cap applies. Available: <strong style={{ color: 'var(--text-primary)' }}>{fmt.number(summary?.points)} pts</strong>
          </p>
          <div>
            <label className="label">Points to convert</label>
            <input 
              className="input-field" 
              type="number" 
              min="1" 
              max={summary?.points}
              value={redeemPoints} 
              onChange={e => setRedeemPoints(e.target.value)}
              placeholder={`Max ${summary?.points}`}
            />
          </div>
          {redeemPoints && Number(redeemPoints) > 0 && (
            <p className="text-sm" style={{ color: 'var(--brand)' }}>
              You'll get: {fmt.currency(redeemPoints)}
            </p>
          )}
          <div className="flex gap-3">
            <button 
              onClick={() => setPointsModal(false)} 
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              onClick={handleRedeemPoints}
              disabled={redeeming || !redeemPoints || Number(redeemPoints) < 1 || Number(redeemPoints) > (summary?.points || 0)} 
              className="btn-primary flex-1"
            >
              {redeeming ? 'Converting…' : 'Convert'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}