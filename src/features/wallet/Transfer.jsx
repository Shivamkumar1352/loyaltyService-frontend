import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckCircle, XCircle, ArrowLeftRight, User } from 'lucide-react'
import { walletAPI } from '../../core/api'
import { fmt } from '../../shared/utils'
import toast from 'react-hot-toast'

export default function Transfer() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'confirm' | 'success' | 'failed'
  const [formData, setFormData] = useState(null)
  const [result, setResult] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onReview = (data) => {
    setFormData(data)
    setStep('confirm')
  }

  const onConfirm = async () => {
    setLoading(true)
    try {
      await walletAPI.transfer({
        receiverId: Number(formData.receiverId),
        amount: Number(formData.amount),
        description: formData.description || '',
        idempotencyKey: `txn-${Date.now()}-${formData.receiverId}`,
      })
      setResult({ status: 'SUCCESS', ...formData })
      setStep('success')
      toast.success('Transfer successful!')
    } catch (err) {
      setResult({ status: 'FAILED', error: err.response?.data?.message || 'Transfer failed' })
      setStep('failed')
    } finally { setLoading(false) }
  }

  const doReset = () => { setStep('form'); setFormData(null); setResult(null); reset() }

  return (
    <div className="max-w-md mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Send / Transfer</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Transfer money to another WalletPay user</p>
      </div>

      {/* Step indicator */}
      {step === 'form' || step === 'confirm' ? (
        <div className="flex gap-2 mb-6">
          {['Details', 'Confirm'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${(step === 'form' && i === 0) || (step === 'confirm' && i <= 1) ? 'text-white' : ''}`}
                style={(step === 'form' && i === 0) || (step === 'confirm' && i <= 1)
                  ? { background: 'var(--brand)' }
                  : { background: 'var(--border)', color: 'var(--text-muted)' }
                }>
                {i + 1}
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</span>
              {i < 1 && <div className="w-8 h-px" style={{ background: 'var(--border)' }} />}
            </div>
          ))}
        </div>
      ) : null}

      {/* Form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit(onReview)} className="space-y-4">
          <div className="card p-5 space-y-4">
            <div>
              <label className="label">Recipient User ID</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                <input className="input-field pl-9" type="number" placeholder="Enter user ID"
                  {...register('receiverId', { required: 'Recipient ID required', min: { value: 1, message: 'Invalid ID' } })} />
              </div>
              {errors.receiverId && <p className="text-xs text-red-500 mt-1">{errors.receiverId.message}</p>}
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input className="input-field text-xl font-bold" type="number" min="1" max="25000" placeholder="0"
                {...register('amount', {
                  required: 'Amount required',
                  min: { value: 1, message: 'Min ₹1' },
                  max: { value: 25000, message: 'Max ₹25,000 per transfer' }
                })} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Maximum ₹25,000 per transfer</p>
            </div>
            <div>
              <label className="label">Note (optional)</label>
              <input className="input-field" placeholder="What's it for?"
                {...register('description', { maxLength: { value: 255, message: 'Max 255 chars' } })} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3">Review Transfer →</button>
        </form>
      )}

      {/* Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card p-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              <ArrowLeftRight size={28} className="text-blue-500" />
            </div>
            <h3 className="text-center font-black text-xl mb-5" style={{ color: 'var(--text-primary)' }}>Confirm Transfer</h3>
            <div className="space-y-3">
              {[
                ['To (User ID)', formData?.receiverId],
                ['Amount', fmt.currency(formData?.amount)],
                ['Note', formData?.description || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="h-px my-4" style={{ background: 'var(--border)' }} />
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              ⚠️ Transfers cannot be reversed. Please double-check before confirming.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep('form')} className="btn-secondary flex-1">← Back</button>
            <button onClick={onConfirm} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Sending…' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="card p-8 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(22,179,110,0.12)' }}>
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Transfer Sent!</h2>
          <p className="text-3xl font-black mb-1" style={{ color: 'var(--brand)' }}>{fmt.currency(result?.amount)}</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Successfully sent to User #{result?.receiverId}</p>
          <button onClick={doReset} className="btn-primary w-full">New Transfer</button>
        </div>
      )}

      {/* Failed */}
      {step === 'failed' && (
        <div className="card p-8 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.12)' }}>
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Transfer Failed</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{result?.error}</p>
          <button onClick={doReset} className="btn-primary w-full">Try Again</button>
        </div>
      )}
    </div>
  )
}
