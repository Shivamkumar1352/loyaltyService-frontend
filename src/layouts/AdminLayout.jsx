import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Users, ShieldCheck, Sun, Moon, Menu, X, ArrowLeft } from 'lucide-react'
import { useThemeStore, useAuthStore } from '../store'
import { fmt } from '../shared/utils'

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
  { to: '/admin/kyc',       icon: ShieldCheck,     label: 'KYC Review' },
]

export default function AdminLayout() {
  const [sideOpen, setSideOpen] = useState(false)
  const { isDark, toggle } = useThemeStore()
  const { user } = useAuthStore()

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {sideOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSideOpen(false)} />}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${sideOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              A
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin</span>
          </div>
          <button onClick={() => setSideOpen(false)} className="lg:hidden btn-ghost p-1.5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 pb-3 space-y-0.5">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setSideOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive ? 'text-white' : ''}
              `}
              style={({ isActive }) => isActive
                ? { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }
                : { color: 'var(--text-secondary)' }
              }
            >
              <Icon size={17} />{label}
            </NavLink>
          ))}
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={17} /> Back to App
          </Link>
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              {fmt.initials(user?.fullName || 'A')}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.fullName}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6 h-14"
          style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setSideOpen(true)} className="lg:hidden btn-ghost p-2 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <button onClick={toggle} className="btn-ghost p-2 rounded-xl" aria-label="Toggle theme">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
