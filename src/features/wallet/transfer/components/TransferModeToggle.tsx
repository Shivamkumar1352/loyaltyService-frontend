import { TRANSFER_TABS } from '../constants'
import type { TransferMode } from '../types'

type TransferModeToggleProps = {
  mode: TransferMode
  onChange: (mode: TransferMode) => void
}

export function TransferModeToggle({ mode, onChange }: TransferModeToggleProps) {
  return (
    <div className="mb-6 flex gap-1 rounded-xl p-1" style={{ background: 'var(--bg-tertiary)' }}>
      {TRANSFER_TABS.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
          style={
            mode === value
              ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
