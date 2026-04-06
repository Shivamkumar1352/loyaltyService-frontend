import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

export const TX_ICON_COMPONENTS: Record<string, LucideIcon> = {
  TOPUP: ArrowDownLeft,
  TRANSFER: ArrowUpRight,
  WITHDRAW: ArrowUpRight,
  CASHBACK: ArrowDownLeft,
  REDEEM: ArrowDownLeft,
}

export const TX_ICON_CLASSNAMES: Record<string, string> = {
  TOPUP: 'text-green-500',
  TRANSFER: 'text-red-400',
  WITHDRAW: 'text-orange-400',
  CASHBACK: 'text-blue-400',
  REDEEM: 'text-purple-400',
}

export const TIER_COLORS = {
  BRONZE: '#cd7f32',
  SILVER: '#9ca3af',
  GOLD: '#f59e0b',
  PLATINUM: '#8b5cf6',
}

export const QUICK_ACTIONS = [
  { to: '/add-money', icon: 'plus', label: 'Add Money', color: '#16b36e' },
  { to: '/transfer', icon: 'transfer', label: 'Send', color: '#3b82f6' },
  { to: '/rewards', icon: 'gift', label: 'Rewards', color: '#8b5cf6' },
] as const

export const FALLBACK_TX_ICON = ArrowLeftRight
