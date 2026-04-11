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

function getErrorMessage(error: unknown, fallback: string) {
  const responseData = (error as {
    response?: {
      data?: string | { message?: string }
    }
  })?.response?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message
  }

  return fallback
}

export default function AddMoney() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<AddMoneyStep>('form')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('card')
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
    script.onerror = () => toast.error('Payment service down. Try again after some time')
    document.body.appendChild(script)
  }, [])

  useEffect(() => {
    if (!successOpen || step !== "success") return;

    const timeoutId = window.setTimeout(() => {
      setSuccessOpen(false);
    }, 1800);

    return () => window.clearTimeout(timeoutId);
  }, [step, successOpen])

  const reportFailedPayment = async (
    formAmount: AddMoneyFormData['amount'],
    failure: {
      razorpayOrderId?: string
      razorpayPaymentId?: string
      errorMessage?: string
    },
  ) => {
    const description = failure.errorMessage || 'Payment failed. Try again after some time'

    setTxResult({
      amount: formAmount,
      status: 'FAILED',
      error: description,
    })
    setStep('failed')

    try {
      if (!failure.razorpayOrderId) {
        return
      }

      await walletAPI.markPaymentFailed({
        razorpayOrderId: failure.razorpayOrderId,
        razorpayPaymentId: failure.razorpayPaymentId,
      })
    } catch {
      // The UI should still reflect the payment failure even if failure logging fails.
    }
  }

  const onSubmit = async (data: AddMoneyFormData) => {
    if (loading) return
    if (paymentCooldown.isCoolingDown) {
      toast.error(`Please wait ${paymentCooldown.remainingSeconds}s before starting another payment`)
      return
    }
    if (!razorpayLoaded) {
      toast.error('Payment service down. Try again after some time')
      return
    }
    paymentCooldown.start(ADD_MONEY_COOLDOWN_MS)
    setLoading(true)
    setStep('processing')
    try {
      let razorpayOrderId: string | undefined
      const originalAlert = window.alert
      let alertHandled = false
      const restoreAlert = () => {
        if (window.alert !== originalAlert) {
          window.alert = originalAlert
        }
      }
      const handleAlertFailure = (message?: unknown) => {
        if (alertHandled) return
        alertHandled = true
        void reportFailedPayment(data.amount, {
          razorpayOrderId,
          errorMessage: typeof message === 'string' && message.trim()
            ? message
            : 'Payment failed. Try again after some time',
        })
        setLoading(false)
        toast.error('Payment failed. Try again after some time')
      }

      window.alert = (msg?: unknown) => {
        const text = typeof msg === 'string' ? msg.toLowerCase() : ''
        if (text.includes('payment') || text.includes('razorpay') || text.includes('oops')) {
          handleAlertFailure(msg)
          return
        }
        originalAlert(msg as string)
      }

      const orderRes = await walletAPI.createOrder(Number(data.amount))
      const orderData = orderRes.data
      razorpayOrderId = orderData.orderId

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData['amount(paise)'] || orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'WalletPay',
        description: 'Add Money to Wallet',
        order_id: orderData.orderId,
        method: {
          card: method === 'card',
          netbanking: method === 'netbanking',
          upi: false,
          wallet: false,
        },
        retry: {
          enabled: false,
        },
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            const verifyRes = await walletAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            setTxResult({
              amount: data.amount,
              status: 'SUCCESS',
              ref: typeof verifyRes.data === 'string' && verifyRes.data.trim()
                ? verifyRes.data
                : verifyRes.data?.referenceId || `TXN${Date.now()}`,
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
            await reportFailedPayment(data.amount, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              errorMessage: getErrorMessage(err, 'Verification failed'),
            })
          } finally {
            restoreAlert()
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
            restoreAlert()
            setStep('form')
            setLoading(false)
            toast.error('Payment cancelled')
          },
          onfailure: function () {
            restoreAlert()
            setLoading(false)
            void reportFailedPayment(data.amount, {
              razorpayOrderId,
              errorMessage: 'Payment failed',
            })
            toast.error('Payment failed')
          },
        },
      }

      try {
        const rzp = new window.Razorpay(options)
        if (typeof rzp.on === 'function') {
          rzp.on('payment.failed', (response) => {
            void reportFailedPayment(data.amount, {
              razorpayOrderId: response?.razorpay_order_id || razorpayOrderId,
              razorpayPaymentId: response?.razorpay_payment_id,
              errorMessage: response?.error?.description || 'Payment failed. Try again after some time',
            })
            setLoading(false)
            toast.error('Payment failed. Try again after some time')
            restoreAlert()
          })
        }
        rzp.open()
      } catch {
        restoreAlert()
        setStep('failed')
        setLoading(false)
        setTxResult({
          amount: data.amount,
          status: 'FAILED',
          error: 'Payment service down. Try again after some time',
        })
        toast.error('Payment service down. Try again after some time')
      }
    } catch (err) {
      setTxResult({
        amount: data.amount,
        status: 'FAILED',
        error: getErrorMessage(err, 'Order creation failed'),
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
