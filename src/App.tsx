import { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { appStore } from './store'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import LandingPage from './features/marketing/LandingPage'
import { PublicRoute, ProtectedRoute } from './app/routes/guards'
import { RouteLoader } from './app/routes/RouteLoader'
import {
  AddMoney,
  AdminDash,
  AdminKyc,
  AdminRewards,
  AdminUsers,
  Analytics,
  Dashboard,
  ForgotPwd,
  Login,
  Profile,
  Rewards,
  Signup,
  Transactions,
  Transfer,
} from './app/routes/lazyRoutes'
import { themeSlice } from './store/slices/themeSlice'

export default function App() {
  useEffect(() => {
    appStore.dispatch(themeSlice.actions.initTheme())
  }, [])

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPwd /></PublicRoute>} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/add-money"    element={<AddMoney />} />
          <Route path="/transfer"     element={<Transfer />} />
          <Route path="/rewards"      element={<Rewards />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics"    element={<Analytics />} />
          <Route path="/profile"      element={<Profile />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDash />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="kyc"       element={<AdminKyc />} />
          <Route path="rewards"   element={<AdminRewards />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
