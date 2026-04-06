import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { AxiosError } from 'axios'
import toast from 'react-hot-toast'
import { walletAPI } from '../../core/api'
import { fmt } from '../../shared/utils'
import PaymentSuccessOverlay from '../../shared/components/PaymentSuccessOverlay'
import { useNotificationStore } from '../../store'
import { useCooldown } from '../../shared/hooks/useCooldown'
import { TransferConfirmCard } from './transfer/components/TransferConfirmCard'
import { TransferForm } from './transfer/components/TransferForm'
import { TransferModeToggle } from './transfer/components/TransferModeToggle'
import { TransferStatusCard } from './transfer/components/TransferStatusCard'
import { TransferStepIndicator } from './transfer/components/TransferStepIndicator'
import type {
  TransferFormData,
  TransferMode,
  TransferResult,
  TransferStep,
  WalletTransferPayload,
  WalletWithdrawPayload,
} from './transfer/types'

const TRANSFER_ACTION_COOLDOWN_MS = 4000

export default function Transfer() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<TransferMode>('transfer')
  const [step, setStep] = useState<TransferStep>('form')
  const [formData, setFormData] = useState<TransferFormData | null>(null)
  const [result, setResult] = useState<TransferResult | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const addNtf = useNotificationStore((s) => s.add)
  const transferCooldown = useCooldown()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransferFormData>()

  const onReview = (data: TransferFormData) => {
    setFormData(data)
    setStep('confirm')
  }

  const onConfirm = async () => {
    if (!formData) return
    if (transferCooldown.isCoolingDown) {
      toast.error(`Please wait ${transferCooldown.remainingSeconds}s before trying again`)
      return
    }

    transferCooldown.start(TRANSFER_ACTION_COOLDOWN_MS)
    setLoading(true)
    try {
      const basePayload = {
        amount: Number(formData.amount),
        description: formData.description || '',
        idempotencyKey: `txn-${Date.now()}-${mode}`,
      }

      if (mode === 'transfer') {
        const payload: WalletTransferPayload = {
          ...basePayload,
          receiverId: Number(formData.receiverId),
        }
        await walletAPI.transfer(payload)
      } else {
        const payload: WalletWithdrawPayload = basePayload
        await walletAPI.withdraw(payload)
      }
      setResult({ status: 'SUCCESS', ...formData })
      setStep('success')
      setSuccessOpen(true)
      addNtf({
        title: mode === 'transfer' ? 'Transfer successful' : 'Withdrawal successful',
        message: mode === 'transfer'
          ? `Sent ${fmt.currency(formData.amount)} to User #${formData.receiverId}`
          : `Processed ${fmt.currency(formData.amount)} withdrawal`,
        severity: 'success',
        href: '/transactions',
      })
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setResult({ status: 'FAILED', error: error.response?.data?.message || (mode === 'transfer' ? 'Transfer failed' : 'Withdrawal failed') })
      setStep('failed')
    } finally { setLoading(false) }
  }

  const doReset = () => { setStep('form'); setFormData(null); setResult(null); reset() }

  return (
    <div className="max-w-md mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
          {mode === 'transfer' ? 'Send / Transfer' : 'Withdraw Money'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {mode === 'transfer' ? 'Transfer money to another WalletPay user' : 'Move money out of your WalletPay balance'}
        </p>
      </div>

      {step === 'form' && (
        <TransferModeToggle
          mode={mode}
          onChange={(nextMode) => {
            setMode(nextMode)
            reset()
          }}
        />
      )}
      <TransferStepIndicator step={step} />

      {step === 'form' && (
        <TransferForm
          mode={mode}
          errors={errors}
          register={register}
          handleSubmit={handleSubmit}
          onReview={onReview}
        />
      )}

      {step === 'confirm' && (
        <TransferConfirmCard
          mode={mode}
          formData={formData}
          loading={loading}
          cooldownSeconds={transferCooldown.remainingSeconds}
          onBack={() => setStep('form')}
          onConfirm={onConfirm}
        />
      )}

      <TransferStatusCard mode={mode} step={step} result={result} onReset={doReset} />

      <PaymentSuccessOverlay
        open={successOpen}
        title={mode === 'transfer' ? 'Transfer successful' : 'Withdrawal successful'}
        subtitle={mode === 'transfer' ? `Sent to User #${result?.receiverId}` : 'Money will reflect shortly'}
        amountText={result?.amount ? fmt.currency(result?.amount) : undefined}
        primaryLabel="Back"
        onClose={() => { setSuccessOpen(false); doReset() }}
      />

    </div>
  )
}
