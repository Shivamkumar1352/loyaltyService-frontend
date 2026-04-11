import { CreditCard, Landmark, type LucideIcon } from 'lucide-react'

export const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000]

export const PAYMENT_METHODS = [
  { id: 'netbanking', label: 'Net Banking', icon: Landmark },
  { id: 'card', label: 'Card', icon: CreditCard },
] as const

export type PaymentMethod = {
  id: string
  label: string
  icon: LucideIcon
}
