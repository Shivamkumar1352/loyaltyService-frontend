import { TRANSFER_STEPS } from '../constants'
import type { TransferStep } from '../types'

export function TransferStepIndicator({ step }: { step: TransferStep }) {
  if (step !== 'form' && step !== 'confirm') return null

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {TRANSFER_STEPS.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              (step === 'form' && index === 0) || (step === 'confirm' && index <= 1) ? 'text-white' : ''
            }`}
            style={
              (step === 'form' && index === 0) || (step === 'confirm' && index <= 1)
                ? { background: 'var(--brand)' }
                : { background: 'var(--border)', color: 'var(--text-muted)' }
            }
          >
            {index + 1}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
          {index < 1 && <div className="h-px w-8" style={{ background: 'var(--border)' }} />}
        </div>
      ))}
    </div>
  )
}
