import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Transfer from './Transfer'
import { renderWithProviders, resetStoreState } from '../../test/testUtils'

const transfer = vi.fn()
const withdraw = vi.fn()

vi.mock('../../core/api', () => ({
  walletAPI: {
    transfer: (...args: unknown[]) => transfer(...args),
    withdraw: (...args: unknown[]) => withdraw(...args),
  },
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Transfer', () => {
  beforeEach(() => {
    resetStoreState()
    transfer.mockReset()
    withdraw.mockReset()
  })

  it('submits a transfer to an email recipient', async () => {
    transfer.mockResolvedValue({ data: {} })

    renderWithProviders(<Transfer />)

    fireEvent.change(screen.getByTitle("Enter the recipient's WalletPay user ID, email, or phone number"), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByTitle('Enter transfer or withdrawal amount (max ₹25,000)'), {
      target: { value: '250' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Review Transfer →' }))

    expect(await screen.findByText('Confirm Transfer')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Send' }))

    await waitFor(() => {
      expect(transfer).toHaveBeenCalled()
    })

    const payload = transfer.mock.calls[0][0]
    expect(payload).toMatchObject({
      amount: 250,
      description: '',
      recipientEmail: 'user@example.com',
    })
    expect(payload.idempotencyKey).toMatch(/^txn-\d+-transfer$/)

    expect(await screen.findByText('Transfer Sent!')).toBeInTheDocument()
  })
})
