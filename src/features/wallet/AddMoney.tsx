import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { walletAPI } from '../../core/api'
import PaymentSuccessOverlay from '../../shared/components/PaymentSuccessOverlay'
import { fmt } from '../../shared/utils'
import { useAuthStore, useNotificationStore } from '../../store'
import { useCooldown } from '../../shared/hooks/useCooldown'
import { AddMoneyForm } from './add-money/components/AddMoneyForm'
import { PaymentStatusCard } from './add-money/components/PaymentStatusCard'
import type { AddMoneyFormData, AddMoneyResult, AddMoneyStep } from './add-money/types'
import { downloadAddMoneyReceipt } from './add-money/utils'

const ADD_MONEY_COOLDOWN_MS = 5000

export default function AddMoney() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<AddMoneyStep>('form')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('upi')
  const [txResult, setTxResult] = useState<AddMoneyResult>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddMoneyFormData>()
  const user = useAuthStore((state) => state.user)
  const addNtf = useNotificationStore((s) => s.add)
  const [successOpen, setSuccessOpen] = useState(false)
  const paymentCooldown = useCooldown()

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayLoaded(true)
    script.onerror = () => toast.error('Failed to load payment gateway')
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!successOpen || step !== "success") return;

    const timeoutId = window.setTimeout(() => {
      setSuccessOpen(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [step, successOpen])

  const onSubmit = async (data: AddMoneyFormData) => {
    if (loading) return
    if (paymentCooldown.isCoolingDown) {
      toast.error(`Please wait ${paymentCooldown.remainingSeconds}s before starting another payment`)
      return
    }
    if (!razorpayLoaded) {
      toast.error('Payment gateway not loaded. Please refresh and try again.')
      return
    }
    paymentCooldown.start(ADD_MONEY_COOLDOWN_MS)
    setLoading(true)
    setStep('processing')
    try {
      const orderRes = await walletAPI.createOrder(Number(data.amount))
      const orderData = orderRes.data

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'WalletPay',
        description: 'Add Money to Wallet',
        order_id: orderData.id || orderData.orderId,
        retry: {
          enabled: false,
        },
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            const verifyRes = await walletAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setTxResult({
              amount: data.amount,
              status: 'SUCCESS',
              ref: verifyRes.data?.referenceId || `TXN${Date.now()}`,
            })
            setStep('success')
            setSuccessOpen(true)
            addNtf({
              title: 'Money added successfully',
              message: `Added ${fmt.currency(data.amount)} to your wallet`,
              severity: 'success',
              href: '/transactions',
            })
          } catch (err) {
            setTxResult({
              amount: data.amount,
              status: 'FAILED',
              error: typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Verification failed',
            })
            setStep('failed')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: user?.name || 'User',
          email: user?.email || 'user@example.com',
        },
        theme: {
          color: '#16b36e',
        },
        modal: {
          ondismiss: function () {
            setStep('form')
            setLoading(false)
            toast.error('Payment cancelled')
          },
          onfailure: function () {
            setStep('failed')
            setLoading(false)
            setTxResult({
              amount: data.amount,
              status: 'FAILED',
              error: 'Payment failed',
            })
            toast.error('Payment failed')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setTxResult({
        amount: data.amount,
        status: 'FAILED',
        error: err.response?.data?.message || 'Order creation failed',
      })
      setStep('failed')
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('form')
    setAmount('')
    setTxResult(null)
  }

  return (
    <div className="max-w-md mx-auto animate-slide-up">
      <div className="mb-6">
        <h1
          className="text-2xl font-black"
          style={{ color: "var(--text-primary)" }}
        >
          Add Money
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Top up your WalletPay balance
        </p>
      </div>

      <PaymentStatusCard
        step={step}
        txResult={txResult}
        onReset={reset}
        onDownloadReceipt={() => downloadAddMoneyReceipt(txResult)}
      />

      <PaymentSuccessOverlay
        open={successOpen}
        title="Payment successful"
        subtitle={txResult?.ref ? `Ref: ${txResult.ref}` : undefined}
        amountText={txResult?.amount ? fmt.currency(txResult.amount) : undefined}
        primaryLabel="Close"
        onClose={() => {
          setSuccessOpen(false);
        }}
      />

      {step === 'form' && (
        <AddMoneyForm
          amount={amount}
          method={method}
          loading={loading}
          errors={errors}
          cooldownSeconds={paymentCooldown.remainingSeconds}
          register={register}
          setValue={setValue}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          onAmountChange={setAmount}
          onMethodChange={setMethod}
        />
      )}
    </div>
  )
}
