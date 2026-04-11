import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Rewards from './Rewards'
import { renderWithProviders, resetStoreState } from '../../test/testUtils'

const getSummary = vi.fn()
const getCatalog = vi.fn()
const getTransactions = vi.fn()
const redeemPoints = vi.fn()

vi.mock('../../core/api', () => ({
  rewardsAPI: {
    getSummary: (...args: unknown[]) => getSummary(...args),
    getCatalog: (...args: unknown[]) => getCatalog(...args),
    getTransactions: (...args: unknown[]) => getTransactions(...args),
    redeemPoints: (...args: unknown[]) => redeemPoints(...args),
    redeem: vi.fn(),
  },
}))

vi.mock('../../shared/components/ScratchCard', () => ({
  default: () => null,
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Rewards', () => {
  beforeEach(() => {
    resetStoreState()
    getSummary.mockReset()
    getCatalog.mockReset()
    getTransactions.mockReset()
    redeemPoints.mockReset()
  })

  it('redeems points to cash', async () => {
    getSummary.mockResolvedValue({
      data: { data: { points: 120, tier: 'SILVER', pointsToNextTier: 30, nextTier: 'GOLD' } },
    })
    getCatalog.mockResolvedValue({ data: { data: [] } })
    getTransactions.mockResolvedValue({ data: { content: [], totalPages: 0 } })
    redeemPoints.mockResolvedValue({ data: {} })

    renderWithProviders(<Rewards />)

    await waitFor(() => {
      expect(getSummary).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Convert Points' }))

    const input = screen.getByTitle('Enter how many points you want to convert to wallet balance')
    fireEvent.change(input, { target: { value: '50' } })

    fireEvent.click(screen.getByRole('button', { name: 'Convert' }))

    await waitFor(() => {
      expect(redeemPoints).toHaveBeenCalledWith(50)
    })
  })
})
