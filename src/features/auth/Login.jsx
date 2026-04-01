import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { authAPI } from '../../core/api'
import { useAuthStore, useThemeStore } from '../../store'
import toast from 'react-hot-toast'

export default function Login() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('email') // 'email' | 'otp'
  const { setAuth } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm()
  const { register: reg2, handleSubmit: hs2, formState: { errors: e2 } } = useForm()

  const onEmailLogin = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.login(data)
      const { accessToken, refreshToken, user } = res.data
      setAuth(user, accessToken, refreshToken)
      toast.success('Welcome back!')
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const onPhoneLogin = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.loginPhone(data)
      const { accessToken, refreshToken, user } = res.data
      setAuth(user, accessToken, refreshToken)
      toast.success('Welcome back!')
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #042a1d 0%, #097349 50%, #16b36e 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black">W</div>
          <span className="text-white font-black text-xl tracking-tight">WalletPay</span>
        </div>
        <div className="relative">
          <h1 className="text-white font-black text-4xl leading-tight mb-4">
            Your money,<br />your control.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Send, receive, and manage your money with lightning-fast transfers and smart rewards.
          </p>
          <div className="mt-8 flex gap-8">
            {[['₹0', 'Transfer fees'], ['2x', 'Faster payments'], ['100%', 'Secure']].map(([v, l]) => (
              <div key={l}>
                <p className="text-white font-black text-2xl">{v}</p>
                <p className="text-white/60 text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs relative">© 2025 WalletPay. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-black text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>Sign in</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back to WalletPay</p>
            </div>
            <button onClick={toggle} className="btn-ghost p-2 rounded-xl">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-tertiary)' }}>
            {[['email', 'Email'], ['phone', 'Phone']].map(([val, label]) => (
              <button key={val} onClick={() => setTab(val)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === val ? 'text-white shadow-sm' : ''}`}
                style={tab === val ? { background: 'var(--brand)' } : { color: 'var(--text-muted)' }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'email' ? (
            <form onSubmit={handleSubmit(onEmailLogin)} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" placeholder="you@example.com"
                  {...register('email', { required: 'Email required' })} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input-field pr-10" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                    {...register('password', { required: 'Password required' })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--brand)' }}>
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={hs2(onPhoneLogin)} className="space-y-4">
              <div>
                <label className="label">Phone Number</label>
                <input className="input-field" type="tel" placeholder="9876543210"
                  {...reg2('phone', { required: 'Phone required', pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' } })} />
                {e2.phone && <p className="text-xs text-red-500 mt-1">{e2.phone.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input className="input-field pr-10" type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                    {...reg2('password', { required: 'Password required' })} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {e2.password && <p className="text-xs text-red-500 mt-1">{e2.password.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/signup" className="font-semibold" style={{ color: 'var(--brand)' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
