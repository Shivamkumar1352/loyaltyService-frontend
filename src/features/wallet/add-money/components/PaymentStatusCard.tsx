import { CheckCircle, Download, XCircle } from 'lucide-react'
import { fmt } from '../../../../shared/utils'
import type { AddMoneyResult, AddMoneyStep } from '../types'

type PaymentStatusCardProps = {
  step: AddMoneyStep
  txResult: AddMoneyResult
  onReset: () => void
  onDownloadReceipt: () => void
}

export function PaymentStatusCard({ step, txResult, onReset, onDownloadReceipt }: PaymentStatusCardProps) {
  if (step === 'processing') {
    return (
      <div className="card p-8 text-center">
        <div
          className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'var(--brand) transparent var(--brand) var(--brand)' }}
        />
        <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Processing Payment…</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Please do not close this window</p>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="card animate-slide-up p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(22,179,110,0.12)' }}
        >
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h2 className="mb-1 text-xl font-black" style={{ color: 'var(--text-primary)' }}>Payment Successful</h2>
        <p className="mb-1 text-3xl font-black" style={{ color: 'var(--brand)' }}>{fmt.currency(txResult?.amount)}</p>
        <p className="mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>Ref: {txResult?.ref}</p>
        <div className="flex gap-3">
          <button onClick={onDownloadReceipt} className="btn-secondary flex-1">
            <Download size={15} /> Receipt
          </button>
          <button onClick={onReset} className="btn-primary flex-1">
            Add More
          </button>
        </div>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="card animate-slide-up p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(239,68,68,0.12)' }}
        >
          <XCircle size={32} className="text-red-500" />
        </div>
        <h2 className="mb-1 text-xl font-black" style={{ color: 'var(--text-primary)' }}>Payment Failed</h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>{txResult?.error}</p>
        <button onClick={onReset} className="btn-primary w-full">Try Again</button>
      </div>
    )
  }

  return null
}
