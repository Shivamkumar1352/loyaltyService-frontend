import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useNotificationStore } from '../../store'
import { fmt } from '../utils'

function severityStyles(sev: string | undefined) {
  if (sev === 'success') return { dot: 'bg-emerald-500', text: 'text-emerald-600' }
  if (sev === 'warning') return { dot: 'bg-amber-500', text: 'text-amber-600' }
  if (sev === 'error') return { dot: 'bg-red-500', text: 'text-red-500' }
  return { dot: 'bg-blue-500', text: 'text-blue-500' }
}

export default function NotificationBell() {
  const { items, remove, clear } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const unreadCount = items.length
  const topItems = useMemo(() => items.slice(0, 12), [items])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost p-2 rounded-xl relative"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[92vw] max-w-sm rounded-2xl shadow-2xl overflow-hidden border animate-slide-up"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          role="dialog"
          aria-label="Notification center"
        >
          <div className="px-4 py-3 flex items-center justify-between border-b"
            style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Notifications</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {unreadCount === 0 ? 'All caught up' : `${unreadCount} new`}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { clear(); setOpen(false) }}
                disabled={unreadCount === 0}
                className={clsx('btn-ghost p-2 rounded-xl', unreadCount === 0 && 'opacity-40 cursor-not-allowed')}
                aria-label="Clear all"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {topItems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No notifications</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>You’ll see updates about payments, rewards, and security here.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
              {topItems.map((n) => {
                const s = severityStyles(n.severity)
                const Row = (
                  <div className="p-4 flex gap-3 hover:opacity-90 transition-opacity">
                    <div className="pt-1">
                      <div className={clsx('w-2.5 h-2.5 rounded-full', s.dot)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                      {n.message && (
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                      )}
                      <p className={clsx('text-[11px] mt-1 font-semibold', s.text)}>
                        {fmt.datetime(n.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(n.id)}
                      className="btn-ghost p-2 rounded-xl self-start"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                )

                return (
                  <div key={n.id}>
                    {n.href ? (
                      <Link to={n.href} onClick={() => setOpen(false)} className="block">
                        {Row}
                      </Link>
                    ) : Row}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

