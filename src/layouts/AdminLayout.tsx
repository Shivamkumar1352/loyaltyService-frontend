import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store'
import { fmt } from '../shared/utils'
import NotificationBell from '../shared/components/NotificationBell'
import { adminNavItems } from './admin-layout/config'
import { LayoutBackdrop } from './shared/LayoutBackdrop'
import { LayoutContent } from './shared/LayoutContent'
import { LayoutShell } from './shared/LayoutShell'
import { LayoutSidebar } from './shared/LayoutSidebar'
import { LayoutTopbar } from './shared/LayoutTopbar'
import { SidebarNav } from './shared/SidebarNav'
import { ThemeToggle } from './shared/ThemeToggle'

export default function AdminLayout() {
  const [sideOpen, setSideOpen] = useState(false)
  const { user } = useAuthStore()

  return (
    <LayoutShell>
      <LayoutBackdrop open={sideOpen} onClose={() => setSideOpen(false)} />
      <LayoutSidebar
        sideOpen={sideOpen}
        onClose={() => setSideOpen(false)}
        header={(
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              A
            </div>
            <span className="font-black text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>Admin</span>
          </div>
        )}
        nav={(
          <SidebarNav
            items={adminNavItems}
            onNavigate={() => setSideOpen(false)}
            accent="linear-gradient(135deg, #7c3aed, #4f46e5)"
            extraLink={(
              <Link
                to="/dashboard"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <ArrowLeft size={17} /> Back to App
              </Link>
            )}
          />
        )}
        footer={(
          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
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
