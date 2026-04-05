import { ReactNode } from 'react'
import { cn, statusClass } from '../utils'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer-line', className)} />
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ status, label }: { status?: string; label?: string }) {
  const cls = statusClass[status] || 'badge-muted'
  return <span className={cn('badge', cls)}>{label ?? status}</span>
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('card relative w-full animate-slide-up p-6', widths[size])}>
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <button
              onClick={onClose}
              className="btn-ghost rounded-lg p-1.5 text-lg leading-none"
              aria-label="Close dialog"
              title="Close dialog"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: {
  icon?: ReactNode
  title: string
  desc?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-5xl mb-4 opacity-30">{icon}</div>}
      <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {desc && <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      {action}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, loading }: {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  loading?: boolean
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      {loading
        ? <Skeleton className="h-8 w-28 mb-1" />
        : <p className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      }
      {sub && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 0} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">← Prev</button>
      <span className="text-xs font-medium px-2" style={{ color: 'var(--text-muted)' }}>
        {page + 1} / {totalPages}
      </span>
      <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next →</button>
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyText = 'No data' }: {
  columns: Array<{ key: string; label: ReactNode; render?: (value: any, row: any) => ReactNode }>
  data: any[]
  loading?: boolean
  emptyText?: string
}) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)' }}>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            : data.length === 0
            ? <tr><td colSpan={columns.length} className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>{emptyText}</td></tr>
            : data.map((row, i) => (
                <tr key={i} className="transition-colors hover:opacity-80" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {c.render ? c.render(row[c.key], row) : row[c.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
          }
        </tbody>
      </table>
    </div>
  )
}
