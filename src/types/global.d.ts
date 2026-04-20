type RazorpayPaymentSuccessResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayPaymentFailureResponse = {
  razorpay_order_id?: string
  razorpay_payment_id?: string
  error?: {
    description?: string
  }
}

type RazorpayEventHandler = (response: RazorpayPaymentFailureResponse) => void

type RazorpayInstance = {
  open: () => void
  on: (event: 'payment.failed', handler: RazorpayEventHandler) => void
}

type RazorpayOptions = {
  handler?: (response: RazorpayPaymentSuccessResponse) => void | Promise<void>
  [key: string]: unknown
}

declare interface Window {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
}
