import { ArrowLeftRight } from 'lucide-react'
import { fmt } from '../../../../shared/utils'
import type { TransferFormData, TransferMode, TransferRecipientType } from '../types'

type TransferConfirmCardProps = {
  mode: TransferMode
  formData: TransferFormData | null
  loading: boolean
  cooldownSeconds: number
  onBack: () => void
  onConfirm: () => void
}

export function TransferConfirmCard({ mode, formData, loading, cooldownSeconds, onBack, onConfirm }: TransferConfirmCardProps) {
  const recipientLabel = (() => {
    const type = formData?.recipientType as TransferRecipientType | undefined
    if (type === 'email') return 'To (Email)'
    if (type === 'phone') return 'To (Phone)'
    return 'To (User ID)'
  })()

  const recipientValue = formData?.recipientValue?.trim() || '—'

  return (
    <div className="animate-slide-up space-y-4">
      <div className="card p-6">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: 'rgba(59,130,246,0.1)' }}
        >
          <ArrowLeftRight size={28} className="text-blue-500" />
        </div>
        <h3 className="mb-5 text-center text-xl font-black" style={{ color: 'var(--text-primary)' }}>
          {mode === 'transfer' ? 'Confirm Transfer' : 'Confirm Withdrawal'}
        </h3>
        <div className="space-y-3">
          {[
            ...(mode === 'transfer' ? [[recipientLabel, recipientValue]] : [['Withdrawal Note', formData?.destination || '—']]),
            ['Amount', fmt.currency(formData?.amount)],
            ['Note', formData?.description || '—'],
          ].map(([key, value]) => (
            <div key={key} className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span style={{ color: 'var(--text-muted)' }}>{key}</span>
              <span className="break-words font-semibold sm:text-right" style={{ color: 'var(--text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="my-4 h-px" style={{ background: 'var(--border)' }} />
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          {mode === 'transfer'
            ? '⚠️ Transfers cannot be reversed. Please double-check before confirming.'
            : '⚠️ Withdrawals will reduce your wallet balance immediately after processing.'}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={onBack} className="btn-secondary flex-1 justify-center">← Back</button>
        <button onClick={onConfirm} disabled={loading || cooldownSeconds > 0} className="btn-primary flex-1 justify-center">
          {loading
            ? (mode === 'transfer' ? 'Sending…' : 'Processing…')
            : cooldownSeconds > 0
              ? `Wait ${cooldownSeconds}s`
              : (mode === 'transfer' ? 'Confirm & Send' : 'Confirm & Withdraw')}
        </button>
      </div>
    </div>
  )
}
