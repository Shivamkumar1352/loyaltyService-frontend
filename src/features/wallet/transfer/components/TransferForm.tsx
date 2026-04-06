import { User } from 'lucide-react'
import type { FieldErrors, UseFormHandleSubmit, UseFormRegister } from 'react-hook-form'
import type { TransferFormData, TransferMode } from '../types'

type TransferFormProps = {
  mode: TransferMode
  errors: FieldErrors<TransferFormData>
  register: UseFormRegister<TransferFormData>
  handleSubmit: UseFormHandleSubmit<TransferFormData>
  onReview: (data: TransferFormData) => void
}

export function TransferForm({ mode, errors, register, handleSubmit, onReview }: TransferFormProps) {
  return (
    <form onSubmit={handleSubmit(onReview)} className="space-y-4">
      <div className="card space-y-4 p-5">
        <div>
          {mode === 'transfer' ? (
            <>
              <label className="label">Recipient User ID</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input
                  className="input-field pl-9"
                  type="number"
                  placeholder="Enter user ID"
                  title="Enter the WalletPay User ID of the recipient"
                  {...register('receiverId', { required: 'Recipient ID required', min: { value: 1, message: 'Invalid ID' } })}
                />
              </div>
              {errors.receiverId?.message && <p className="mt-1 text-xs text-red-500">{errors.receiverId.message}</p>}
            </>
          ) : (
            <>
              <label className="label">Withdrawal Note</label>
              <input
                className="input-field"
                placeholder="Optional note for this withdrawal"
                title="Add an optional note for this withdrawal"
                {...register('destination')}
              />
            </>
          )}
        </div>
        <div>
          <label className="label">Amount (₹)</label>
          <input
            className="input-field text-xl font-bold"
            type="number"
            min="1"
            max="25000"
            placeholder="0"
            title="Enter transfer or withdrawal amount (max ₹25,000)"
            {...register('amount', {
              required: 'Amount required',
              min: { value: 1, message: 'Min ₹1' },
              max: { value: 25000, message: 'Max ₹25,000 per transfer' },
            })}
          />
          {errors.amount?.message && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {mode === 'transfer' ? 'Maximum ₹25,000 per transfer' : 'Maximum ₹25,000 per withdrawal'}
          </p>
        </div>
        <div>
          <label className="label">{mode === 'transfer' ? 'Note (optional)' : 'Description (optional)'}</label>
          <input
            className="input-field"
            placeholder="What's it for?"
            title="Optional note describing this transfer or withdrawal"
            {...register('description', { maxLength: { value: 255, message: 'Max 255 chars' } })}
          />
        </div>
      </div>
      <button type="submit" className="btn-primary w-full py-3">
        {mode === 'transfer' ? 'Review Transfer →' : 'Review Withdrawal →'}
      </button>
    </form>
  )
}
