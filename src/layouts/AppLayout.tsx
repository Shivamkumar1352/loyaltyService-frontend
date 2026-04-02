import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Plus, ArrowLeftRight, Gift, History,
  User, Sun, Moon, Menu, X, LogOut, ShieldCheck
} from 'lucide-react'
import { useThemeStore, useAuthStore } from '../store'
import { authAPI } from '../core/api'
import toast from 'react-hot-toast'
import { fmt } from '../shared/utils'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-money',    icon: Plus,             label: 'Add Money' },
  { to: '/transfer',     icon: ArrowLeftRight,   label: 'Send / Transfer' },
  { to: '/rewards',      icon: Gift,             label: 'Rewards' },
  { to: '/transactions', icon: History,          label: 'Transactions' },
  { to: '/profile',      icon: User,             label: 'Profile / KYC' },
]

export default function AppLayout() {
  const [sideOpen, setSideOpen] = useState(false)
  const { isDark, toggle } = useThemeStore()
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authAPI.logout({ refreshToken }) } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 min-w-64 max-w-64 flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              W
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>WalletPay</span>
          </div>
          <button onClick={() => setSideOpen(false)} className="lg:hidden btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        {/* <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto"> */}
        <nav className="flex-1 px-3 pb-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSideOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'text-white shadow-glow'
                  : 'hover:opacity-80'}
              `}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))', color: 'white' }
                : { color: 'var(--text-secondary)' }
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <NavLink to="/admin/dashboard" onClick={() => setSideOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: 'var(--brand)' }}>
              <ShieldCheck size={17} />
              Admin Panel
            </NavLink>
          )}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              {fmt.initials(user?.fullName || user?.name || 'U')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full btn-ghost flex items-center gap-2 text-xs rounded-lg py-2 justify-center"
            style={{ color: 'var(--text-muted)' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 h-14"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSideOpen(true)} className="lg:hidden btn-ghost p-2 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="btn-ghost p-2 rounded-xl"
              aria-label="Toggle theme">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
