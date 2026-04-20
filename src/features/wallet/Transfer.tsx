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
  TransferRecipientType,
  TransferResult,
  TransferStep,
  WalletTransferPayload,
  WalletWithdrawPayload,
} from './transfer/types'

const TRANSFER_ACTION_COOLDOWN_MS = 4000

function detectRecipientType(value: string): TransferRecipientType | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'email'
  if (/^\d{10,15}$/.test(trimmed)) return trimmed.length >= 10 ? 'phone' : 'id'
  if (/^[1-9]\d*$/.test(trimmed)) return 'id'
  return null
}

export default function Transfer() {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<TransferMode>('transfer')
  const [step, setStep] = useState<TransferStep>('form')
  const [formData, setFormData] = useState<TransferFormData | null>(null)
  const [result, setResult] = useState<TransferResult | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const addNtf = useNotificationStore((s) => s.add)
  const transferCooldown = useCooldown()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransferFormData>()

  const getRecipientText = (data: TransferFormData | TransferResult | null) => {
    const value = data?.recipientValue?.trim()
    if (!value) return 'recipient'
    const recipientType = (data?.recipientType as TransferRecipientType | undefined) ?? detectRecipientType(value)
    if (recipientType === 'email') return value
    if (recipientType === 'phone') return value
    return `User #${value}`
  }

  const onReview = (data: TransferFormData) => {
    const recipientValue = data.recipientValue?.trim() || ''
    const recipientType = detectRecipientType(recipientValue)
    setFormData({
      ...data,
      recipientValue,
      recipientType: recipientType || undefined,
    })
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
        const recipientValue = formData.recipientValue?.trim() || ''
        const recipientType = formData.recipientType || detectRecipientType(recipientValue) || 'id'
        const payload: WalletTransferPayload = { ...basePayload }

        if (recipientType === 'email') {
          payload.recipientEmail = recipientValue
        } else if (recipientType === 'phone') {
          payload.recipientPhone = recipientValue
        } else {
          payload.receiverId = Number(recipientValue)
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
          ? `Sent ${fmt.currency(formData.amount)} to ${getRecipientText(formData)}`
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
    <div className="mx-auto w-full max-w-md animate-slide-up">
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
          watch={watch}
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
        subtitle={mode === 'transfer' ? `Sent to ${getRecipientText(result)}` : 'Money will reflect shortly'}
        amountText={result?.amount ? fmt.currency(result?.amount) : undefined}
        primaryLabel="Back"
        onClose={() => { setSuccessOpen(false); doReset() }}
      />

    </div>
  )
}
