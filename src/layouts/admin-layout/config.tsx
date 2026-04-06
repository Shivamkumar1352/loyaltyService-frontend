import { Gift, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import type { NavItem } from '../shared/navTypes'

export const adminNavItems: NavItem[] = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/kyc', icon: ShieldCheck, label: 'KYC Review' },
  { to: '/admin/rewards', icon: Gift, label: 'Rewards' },
]
