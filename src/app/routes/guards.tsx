import { useEffect, useState, type ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store'
import { RouteLoader } from './RouteLoader'
import { fetchKycGate } from '../../features/profile/kycAccess'

type GuardProps = {
  children: ReactElement
  adminOnly?: boolean
}

export function ProtectedRoute({ children, adminOnly = false }: GuardProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()
  const [kycGate, setKycGate] = useState<{ loading: boolean; approved: boolean; redirectTo: string | null }>({
    loading: !adminOnly,
    approved: false,
    redirectTo: null,
  })

  useEffect(() => {
    let active = true

    if (!isAuthenticated || adminOnly || user?.role === 'ADMIN') {
      setKycGate({ loading: false, approved: true, redirectTo: null })
      return () => { active = false }
    }

    setKycGate((current) => ({ ...current, loading: true }))

    fetchKycGate()
      .then((gate) => {
        if (!active) return
        setKycGate({ loading: false, approved: gate.approved, redirectTo: gate.redirectTo })
      })
      .catch(() => {
        if (!active) return
        setKycGate({ loading: false, approved: true, redirectTo: null })
      })

    return () => { active = false }
  }, [adminOnly, isAuthenticated, user?.role])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  if (!adminOnly && user?.role !== 'ADMIN') {
    if (kycGate.loading) return <RouteLoader />
    if (!kycGate.approved && location.pathname !== '/profile') {
      return <Navigate to={kycGate.redirectTo || '/profile?tab=kyc&kycRequired=1'} replace />
    }
  }
  return children
}

export function PublicRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) return <Navigate to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />
  return children
}
