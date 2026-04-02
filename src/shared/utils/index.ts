import { clsx } from 'clsx'

// ─── cn helper ────────────────────────────────────────────────────────────────
export function cn(...inputs) { return clsx(inputs) }

// ─── Format helpers ───────────────────────────────────────────────────────────
export const fmt = {
  currency: (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n ?? 0),
  date: (d) => d ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d)) : '—',
  datetime: (d) => d ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d)) : '—',
  number: (n) => new Intl.NumberFormat('en-IN').format(n ?? 0),
  initials: (name) => name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? '?',
}

// ─── Status badge map ─────────────────────────────────────────────────────────
export const statusClass = {
  ACTIVE: 'badge-success', APPROVED: 'badge-success', SUCCESS: 'badge-success', COMPLETED: 'badge-success',
  PENDING: 'badge-warning', BLOCKED: 'badge-danger', FAILED: 'badge-danger', REJECTED: 'badge-danger',
  REVERSED: 'badge-info', NOT_SUBMITTED: 'badge-muted',
}
