import { CheckCircle, XCircle } from 'lucide-react'
import { fmt } from '../../../../shared/utils'
import type { TransferMode, TransferResult, TransferStep } from '../types'

type TransferStatusCardProps = {
  mode: TransferMode
  step: TransferStep
  result: TransferResult | null
  onReset: () => void
}

export function TransferStatusCard({ mode, step, result, onReset }: TransferStatusCardProps) {
  if (step === 'success') {
    return (
      <div className="card animate-slide-up p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(22,179,110,0.12)' }}>
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="mb-1 text-xl font-black" style={{ color: 'var(--text-primary)' }}>
          {mode === 'transfer' ? 'Transfer Sent!' : 'Withdrawal Submitted!'}
        </h2>
        <p className="mb-1 text-3xl font-black" style={{ color: 'var(--brand)' }}>{fmt.currency(result?.amount)}</p>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
          {mode === 'transfer'
            ? `Successfully sent to User #${result?.receiverId}`
            : 'Your withdrawal request was submitted successfully'}
        </p>
        <button onClick={onReset} className="btn-primary w-full">
          {mode === 'transfer' ? 'New Transfer' : 'New Withdrawal'}
        </button>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="card animate-slide-up p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="mb-1 text-xl font-black" style={{ color: 'var(--text-primary)' }}>
          {mode === 'transfer' ? 'Transfer Failed' : 'Withdrawal Failed'}
        </h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>{result?.error}</p>
        <button onClick={onReset} className="btn-primary w-full">Try Again</button>
      </div>
    )
  }

  return null
}
