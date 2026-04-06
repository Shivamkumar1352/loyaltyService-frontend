import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Sun, Moon, Mail, Phone, KeyRound, MessageSquareText } from 'lucide-react'
import { authAPI } from '../../core/api'
import { useAuthStore, useThemeStore } from '../../store'
import toast from 'react-hot-toast'
import { normalizeIdentifier } from './authUtils'
import { useCooldown } from '../../shared/hooks/useCooldown'
import { fetchKycGate } from '../profile/kycAccess'

const LOGIN_SUBMIT_COOLDOWN_MS = 2000
const OTP_RESEND_COOLDOWN_MS = 30000

export default function Login() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [otpStep, setOtpStep] = useState<'enter_id' | 'enter_otp'>('enter_id')
  const [identifier, setIdentifier] = useState('')
  const { setAuth } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const loginCooldown = useCooldown()
  const otpResendCooldown = useCooldown()

  const { register, handleSubmit, formState: { errors }, setValue } = useForm()

  const doSetAuthFromResponse = async (res) => {
    const payload = res?.data?.data ?? res?.data ?? res
    const { accessToken, refreshToken, user } = payload || {}
    if (!accessToken || !user) {
      throw new Error('Invalid login response')
    }
    setAuth(user, accessToken, refreshToken)

    if (user.role === 'ADMIN') {
      navigate('/admin/dashboard')
      return
    }

    try {
      const gate = await fetchKycGate()
      navigate(gate.approved ? '/dashboard' : gate.redirectTo)
    } catch {
      navigate('/dashboard')
    }
  }

  const onPasswordLogin = async (data) => {
    if (loginCooldown.isCoolingDown) {
      toast.error(`Please wait ${loginCooldown.remainingSeconds}s before trying again`)
      return
    }

    loginCooldown.start(LOGIN_SUBMIT_COOLDOWN_MS)
    setLoading(true)
    try {
      const { raw, phone, isEmail, isPhone } = normalizeIdentifier(data.identifier)
      if (!raw) throw new Error('Identifier required')
      const pwd = data.password
      if (!pwd) throw new Error('Password required')

      const res = isEmail
        ? await authAPI.login({ email: raw, password: pwd })
        : await authAPI.loginPhone({ phone: isPhone ? phone : raw, password: pwd })

      doSetAuthFromResponse(res)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const onSendOtp = async (data) => {
    if (loginCooldown.isCoolingDown) {
      toast.error(`Please wait ${loginCooldown.remainingSeconds}s before requesting OTP again`)
      return
    }

    loginCooldown.start(LOGIN_SUBMIT_COOLDOWN_MS)
    setLoading(true)
    try {
      const { raw, phone, isEmail, isPhone } = normalizeIdentifier(data.identifier)
      if (!raw) throw new Error('Identifier required')
      setIdentifier(raw)

      if (isEmail) await authAPI.sendOtp({ email: raw })
      else await authAPI.sendOtp({ phone: isPhone ? phone : raw })

      toast.success('OTP sent')
      setOtpStep('enter_otp')
      otpResendCooldown.start(OTP_RESEND_COOLDOWN_MS)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const onVerifyOtpLogin = async (data) => {
    if (loginCooldown.isCoolingDown) {
      toast.error(`Please wait ${loginCooldown.remainingSeconds}s before trying again`)
      return
    }

    loginCooldown.start(LOGIN_SUBMIT_COOLDOWN_MS)
    setLoading(true)
    try {
      const { raw, phone, isEmail, isPhone } = normalizeIdentifier(identifier)
      if (!raw) throw new Error('Identifier required')

      const res = isEmail
        ? await authAPI.verifyOtp({ email: raw, otp: data.otp })
        : await authAPI.verifyOtp({ phone: isPhone ? phone : raw, otp: data.otp })

      doSetAuthFromResponse(res)
      toast.success('Welcome back!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
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
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black">B</div>
          <span className="text-white font-black text-xl tracking-tight">Batua</span>
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
        <p className="text-white/40 text-xs relative">© 2026 WalletPay. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-black text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>Sign in</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Welcome back to Batua</p>
            </div>
            <button
              onClick={toggle}
              className="btn-ghost p-2 rounded-xl"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-tertiary)' }}>
            <button
              type="button"
              onClick={() => { setMode('password'); setOtpStep('enter_id'); setIdentifier(''); setValue('otp', '') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'password' ? 'text-white shadow-sm' : ''}`}
              style={mode === 'password' ? { background: 'var(--brand)' } : { color: 'var(--text-muted)' }}
            >
              <div className="inline-flex items-center gap-2 justify-center">
                <KeyRound size={15} /> Password
              </div>
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setOtpStep('enter_id'); setIdentifier(''); setValue('password', '') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'otp' ? 'text-white shadow-sm' : ''}`}
              style={mode === 'otp' ? { background: 'var(--brand)' } : { color: 'var(--text-muted)' }}
            >
              <div className="inline-flex items-center gap-2 justify-center">
                <MessageSquareText size={15} /> OTP
              </div>
            </button>
          </div>

          {mode === 'password' ? (
            <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4">
              <div>
                <label className="label">Email or phone</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    className="input-field pl-9"
                    placeholder="you@example.com or 9876543210"
                    autoComplete="username"
                    title="Enter your registered email address or phone number"
                    {...register('identifier', { required: 'Email or phone required' })}
                  />
                  <Phone size={15} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
                {errors.identifier && <p className="text-xs text-red-500 mt-1">{String(errors.identifier.message)}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input-field pr-10"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    title="Enter your account password"
                    autoComplete="current-password"
                    {...register('password', { required: 'Password required' })} />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                    title={showPwd ? 'Hide password' : 'Show password'}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{String(errors.password.message)}</p>}
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--brand)' }}>
                  Forgot password?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in…' : loginCooldown.isCoolingDown ? `Try again in ${loginCooldown.remainingSeconds}s` : 'Sign in'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {otpStep === 'enter_id' ? (
                <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
                  <div>
                    <label className="label">Email address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                      <input
                        className="input-field pl-9"
                        placeholder="you@example.com or 9876543210"
                        title="Enter email or phone to receive OTP"
                        {...register('identifier', { required: 'Email address required' })}
                      />
                      {/* <Phone size={15} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30" /> */}
                    </div>
                    {errors.identifier && <p className="text-xs text-red-500 mt-1">{String(errors.identifier.message)}</p>}
                  </div>
                  <button type="submit" disabled={loading || loginCooldown.isCoolingDown} className="btn-primary w-full">
                    {loading ? 'Sending OTP…' : loginCooldown.isCoolingDown ? `Wait ${loginCooldown.remainingSeconds}s` : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onVerifyOtpLogin)} className="space-y-4">
                  <div className="rounded-xl p-3 text-xs"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    OTP sent to <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{identifier}</span>
                  </div>
                  <div>
                    <label className="label">One-Time Password</label>
                    <input
                      className="input-field text-center text-2xl font-mono tracking-widest"
                      maxLength={8}
                      placeholder="······"
                      title="Enter the OTP sent to your email or phone"
                      {...register('otp', { required: 'OTP required', minLength: { value: 4, message: 'Min 4 digits' } })}
                    />
                    {errors.otp && <p className="text-xs text-red-500 mt-1">{String(errors.otp.message)}</p>}
                  </div>
                  <button type="submit" disabled={loading || loginCooldown.isCoolingDown} className="btn-primary w-full">
                    {loading ? 'Verifying…' : loginCooldown.isCoolingDown ? `Wait ${loginCooldown.remainingSeconds}s` : 'Verify & Sign in'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setOtpStep('enter_id'); setIdentifier(''); setValue('otp', '') }}
                      className="btn-secondary flex-1"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      disabled={loading || otpResendCooldown.isCoolingDown}
                      onClick={async () => {
                        if (otpResendCooldown.isCoolingDown) {
                          toast.error(`Please wait ${otpResendCooldown.remainingSeconds}s before resending OTP`)
                          return
                        }

                        const { raw, phone, isEmail, isPhone } = normalizeIdentifier(identifier)
                        try {
                          if (isEmail) await authAPI.sendOtp({ email: raw })
                          else await authAPI.sendOtp({ phone: isPhone ? phone : raw })
                          otpResendCooldown.start(OTP_RESEND_COOLDOWN_MS)
                          toast.success('OTP resent')
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Failed to resend OTP')
                        }
                      }}
                      className="btn-ghost flex-1 text-xs"
                    >
                      {otpResendCooldown.isCoolingDown ? `Resend in ${otpResendCooldown.remainingSeconds}s` : 'Resend OTP'}
                    </button>
                  </div>
                </form>
              )}
            </div>
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
