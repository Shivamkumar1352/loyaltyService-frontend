import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import AddMoney from './AddMoney'
import { renderWithProviders, resetStoreState } from '../../test/testUtils'

const createOrder = vi.fn()
const verifyPayment = vi.fn()
const markPaymentFailed = vi.fn()

vi.mock('../../core/api', () => ({
  walletAPI: {
    createOrder: (...args: unknown[]) => createOrder(...args),
    verifyPayment: (...args: unknown[]) => verifyPayment(...args),
    markPaymentFailed: (...args: unknown[]) => markPaymentFailed(...args),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('AddMoney', () => {
  beforeEach(() => {
    resetStoreState()
    createOrder.mockReset()
    verifyPayment.mockReset()
    markPaymentFailed.mockReset()
  })

  it('processes a successful add money flow', async () => {
    createOrder.mockResolvedValue({
      data: { 'amount(paise)': 500, currency: 'INR', orderId: 'order_123' },
    })
    verifyPayment.mockResolvedValue({ data: 'Payment verified & wallet credited' })

    class RazorpayMock {
      options: any
      constructor(options: any) {
        this.options = options
      }
      on() {}
      open() {
        this.options.handler({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'sig_123',
        })
      }
    }

    window.Razorpay = RazorpayMock

    renderWithProviders(<AddMoney />)

    const amountInput = screen.getByTitle('Enter the amount you want to add')
    fireEvent.change(amountInput, { target: { value: '500' } })

    const payButton = screen.getByRole('button', { name: /Pay/i })
    fireEvent.click(payButton)

    await waitFor(() => {
      expect(createOrder).toHaveBeenCalledWith(500)
    })

    await waitFor(() => {
      expect(verifyPayment).toHaveBeenCalledWith({
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
        razorpaySignature: 'sig_123',
      })
    })

    expect(await screen.findByText('Payment Successful')).toBeInTheDocument()
    const refs = screen.getAllByText('Ref: Payment verified & wallet credited')
    expect(refs.length).toBeGreaterThan(0)
    expect(markPaymentFailed).not.toHaveBeenCalled()
  })

  it('reports failed payments with the backend request shape', async () => {
    createOrder.mockResolvedValue({
      data: { 'amount(paise)': 500, currency: 'INR', orderId: 'order_123' },
    })

    class RazorpayMock {
      private listeners: Record<string, (payload: any) => void> = {}

      on(event: string, callback: (payload: any) => void) {
        this.listeners[event] = callback
      }

      open() {
        this.listeners['payment.failed']?.({
          razorpay_order_id: 'order_123',
          razorpay_payment_id: 'pay_123',
          error: {
            description: 'Card declined',
          },
        })
      }
    }

    window.Razorpay = RazorpayMock

    renderWithProviders(<AddMoney />)

    const amountInput = screen.getByTitle('Enter the amount you want to add')
    fireEvent.change(amountInput, { target: { value: '500' } })

    const payButton = screen.getByRole('button', { name: /Pay/i })
    fireEvent.click(payButton)

    await waitFor(() => {
      expect(markPaymentFailed).toHaveBeenCalledWith({
        razorpayOrderId: 'order_123',
        razorpayPaymentId: 'pay_123',
      })
    })
  })
})
