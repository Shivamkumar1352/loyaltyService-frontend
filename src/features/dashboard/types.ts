export type DashboardBalance = {
  balance?: number
  status?: string
  lastUpdated?: string
}

export type DashboardRewards = {
  points?: number
  tier?: keyof typeof import('./constants').TIER_COLORS
  nextTier?: string
  pointsToNextTier?: number
}

export type DashboardTransaction = {
  id: string | number
  type: string
  description?: string
  createdAt?: string
  amount?: number
  status?: string
}
