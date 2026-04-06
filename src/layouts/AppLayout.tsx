import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store'
import { authAPI } from '../core/api'
import toast from 'react-hot-toast'
import { fmt } from '../shared/utils'
import NotificationBell from '../shared/components/NotificationBell'
import { appNavItems } from './app-layout/config'
import { LayoutBackdrop } from './shared/LayoutBackdrop'
import { LayoutContent } from './shared/LayoutContent'
import { LayoutShell } from './shared/LayoutShell'
import { LayoutSidebar } from './shared/LayoutSidebar'
import { LayoutTopbar } from './shared/LayoutTopbar'
import { SidebarNav } from './shared/SidebarNav'
import { ThemeToggle } from './shared/ThemeToggle'

export default function AppLayout() {
  const [sideOpen, setSideOpen] = useState(false)
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authAPI.logout({ refreshToken }) } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return (
    <LayoutShell>
      <LayoutBackdrop open={sideOpen} onClose={() => setSideOpen(false)} />
      <LayoutSidebar
        sideOpen={sideOpen}
        onClose={() => setSideOpen(false)}
        header={(
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
              B
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>Batua</span>
          </div>
        )}
        nav={(
          <SidebarNav
            items={appNavItems}
            onNavigate={() => setSideOpen(false)}
            accent="linear-gradient(135deg, var(--brand), var(--brand-dark))"
            extraLink={user?.role === 'ADMIN' ? (
              <NavLink
                to="/admin/dashboard"
                onClick={() => setSideOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--brand)' }}
              >
                <ShieldCheck size={17} />
                Admin Panel
              </NavLink>
            ) : null}
          />
        )}
        footer={(
          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
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
        )}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <LayoutTopbar
          onOpenMenu={() => setSideOpen(true)}
          actions={(
            <>
            <NotificationBell />
            <ThemeToggle />
            </>
          )}
        />
        <LayoutContent />
      </div>
    </LayoutShell>
  )
}
