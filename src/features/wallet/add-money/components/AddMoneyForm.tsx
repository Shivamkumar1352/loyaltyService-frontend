import type { UseFormHandleSubmit, UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form'
import { fmt } from '../../../../shared/utils'
import { PAYMENT_METHODS, QUICK_AMOUNTS } from '../constants'
import type { AddMoneyFormData } from '../types'

type AddMoneyFormProps = {
  amount: string
  method: string
  loading: boolean
  cooldownSeconds: number
  errors: FieldErrors<AddMoneyFormData>
  register: UseFormRegister<AddMoneyFormData>
  setValue: UseFormSetValue<AddMoneyFormData>
  handleSubmit: UseFormHandleSubmit<AddMoneyFormData>
  onSubmit: (data: AddMoneyFormData) => void
  onAmountChange: (value: string) => void
  onMethodChange: (value: string) => void
}

export function AddMoneyForm({
  amount,
  method,
  loading,
  cooldownSeconds,
  errors,
  register,
  setValue,
  handleSubmit,
  onSubmit,
  onAmountChange,
  onMethodChange,
}: AddMoneyFormProps) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="card p-5">
        <label className="label">Enter Amount (₹)</label>
        <input
          className="input-field text-2xl font-black text-center"
          type="number"
          min="1"
          placeholder="0"
          value={amount}
          title="Enter the amount you want to add"
          {...register('amount', {
            required: 'Amount required',
            min: { value: 1, message: 'Min ₹1' },
          })}
          onChange={(event) => {
            onAmountChange(event.target.value)
            setValue('amount', event.target.value)
          }}
        />
        {errors.amount && <p className="mt-1 text-center text-xs text-red-500">{errors.amount.message}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              onClick={() => {
                onAmountChange(String(quickAmount))
                setValue('amount', quickAmount)
              }}
              className={`rounded-xl border py-2 text-sm font-semibold transition-all ${
                Number(amount) === quickAmount ? 'border-transparent text-white' : 'border-transparent'
              }`}
              style={
                Number(amount) === quickAmount
                  ? { background: 'var(--brand)' }
                  : {
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }
              }
              title={`Quick amount ₹${quickAmount}`}
            >
              ₹{quickAmount}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <label className="label mb-3 block">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onMethodChange(id)}
              className="flex items-center gap-3 rounded-xl border-2 p-3 text-sm font-medium transition-all"
              style={
                method === id
                  ? {
                      borderColor: 'var(--brand)',
                      background: 'rgba(22,179,110,0.08)',
                      color: 'var(--brand)',
                    }
                  : {
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-tertiary)',
                }
              }
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          🔒 Secured by Razorpay. Your payment info is encrypted.
        </p>
      </div>

      {amount && Number(amount) > 0 && (
        <div className="card animate-slide-up p-4">
          <div className="mb-1 flex justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Amount</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt.currency(amount)}</span>
          </div>
          <div className="mb-1 flex justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Processing fee</span>
            <span className="font-semibold text-green-500">Free</span>
          </div>
          <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
          <div className="flex justify-between text-sm font-bold">
            <span style={{ color: 'var(--text-primary)' }}>Total</span>
            <span style={{ color: 'var(--brand)' }}>{fmt.currency(amount)}</span>
          </div>
        </div>
      )}

      <button type="submit" disabled={loading || cooldownSeconds > 0} className="btn-primary w-full py-3 text-base">
        {loading ? 'Processing…' : cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : `Pay ${amount ? fmt.currency(amount) : ''}`}
      </button>
    </form>
  )
}
