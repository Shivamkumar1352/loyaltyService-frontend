import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore, useAuthStore } from './store'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'

const Login = lazy(() => import('./features/auth/Login'))
const Signup = lazy(() => import('./features/auth/Signup'))
const ForgotPwd = lazy(() => import('./features/auth/ForgotPassword'))
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'))
const AddMoney = lazy(() => import('./features/wallet/AddMoney'))
const Transfer = lazy(() => import('./features/wallet/Transfer'))
const Rewards = lazy(() => import('./features/rewards/Rewards'))
const Transactions = lazy(() => import('./features/transactions/Transactions'))
const Profile = lazy(() => import('./features/profile/Profile'))
const Analytics = lazy(() => import('./features/analytics/Analytics'))
const AdminDash = lazy(() => import('./features/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./features/admin/AdminUsers'))
const AdminKyc = lazy(() => import('./features/admin/AdminKyc'))
const AdminRewards = lazy(() => import('./features/admin/AdminRewards'))

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--brand) transparent var(--brand) var(--brand)' }} />
    </div>
  )
}

function ProtectedRoute({ children, adminOnly = false }: { children: JSX.Element; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { init } = useThemeStore()
  useEffect(() => { init() }, [init])

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public */}
        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPwd /></PublicRoute>} />

        {/* User app */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="add-money"    element={<AddMoney />} />
          <Route path="transfer"     element={<Transfer />} />
          <Route path="rewards"      element={<Rewards />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics"    element={<Analytics />} />
          <Route path="profile"      element={<Profile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDash />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="kyc"       element={<AdminKyc />} />
          <Route path="rewards"   element={<AdminRewards />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
