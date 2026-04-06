import {
  ArrowLeftRight,
  BarChart3,
  Gift,
  History,
  LayoutDashboard,
  Plus,
  User,
} from 'lucide-react'
import type { NavItem } from '../shared/navTypes'

export const appNavItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-money', icon: Plus, label: 'Add Money' },
  { to: '/transfer', icon: ArrowLeftRight, label: 'Send / Transfer' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/transactions', icon: History, label: 'Transactions' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile / KYC' },
]
