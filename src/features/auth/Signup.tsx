import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Sun, Moon } from 'lucide-react'
import { authAPI } from '../../core/api'
import { useThemeStore } from '../../store'
import toast from 'react-hot-toast'
import { validateEmail, validateOtp, validatePassword, validatePhone } from './authUtils'

export default function Signup() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'verify'
  const [email, setEmail] = useState('')
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const { register: regOtp, handleSubmit: hsOtp, formState: { errors: eOtp } } = useForm()

  const onSignup = async (data) => {
    setLoading(true)
    try {
      await authAPI.signup({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      setEmail(data.email)
      await authAPI.sendOtp({ email: data.email })
      toast.success('Account created. Verify your email to continue.')
      setStep('verify')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed')
    } finally { setLoading(false) }
  }

  const onVerify = async (data) => {
    setLoading(true)
    try {
      await authAPI.verifyOtp({ email, otp: data.otp })
      toast.success('Email verified! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh]" style={{ background: 'var(--bg-primary)' }}>
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
            Join millions<br />of smart<br />spenders.
          </h1>
          <p className="text-white/70 text-base">Sign up in under 60 seconds. No hidden fees, ever.</p>
        </div>
        <p className="text-white/40 text-xs relative">© 2026 WalletPay. All rights reserved.</p>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {step === 'form' ? 'Create account' : 'Verify email'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {step === 'form' ? 'Start your Batua journey' : `OTP sent to ${email}`}
              </p>
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

          {step === 'form' ? (
            <form onSubmit={handleSubmit(onSignup)} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  placeholder="Jane Smith"
                  title="Enter your full legal name"
                  {...register('fullName', {
                    validate: (value) => {
                      const trimmed = (value || '').trim()
                      if (!trimmed) return 'Name required'
                      if (trimmed.length < 2) return 'Min 2 chars'
                      return /^[A-Za-z][A-Za-z\s'.-]*$/.test(trimmed) || 'Enter a valid full name'
                    }
                  })} />
                {errors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {String((errors.fullName.message as any)?.message ?? errors.fullName.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@example.com"
                  title="Enter a valid email address"
                  {...register('email', { validate: validateEmail })} />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {String((errors.email.message as any)?.message ?? errors.email.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="9876543210"
                  title="Enter your phone number (10 digits)"
                  {...register('phone', { validate: validatePhone })} />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {String((errors.phone.message as any)?.message ?? errors.phone.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input-field pr-10"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min 8 chars"
                    title="Password with at least 8 characters, including upper, lower, number, and symbol"
                    {...register('password', { validate: validatePassword })} />
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
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {String((errors.password.message as any)?.message ?? errors.password.message)}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Re-enter password"
                  title="Re-enter the same password for confirmation"
                  {...register('confirm', {
                    validate: (value) => {
                      if (!value?.trim()) return 'Please confirm password'
                      return value === watch('password') || 'Passwords do not match'
                    }
                  })} />
                {errors.confirm && (
                  <p className="text-xs text-red-500 mt-1">
                    {String((errors.confirm.message as any)?.message ?? errors.confirm.message)}
                  </p>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                By creating an account you agree to our Terms & Privacy Policy.
              </p>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={hsOtp(onVerify)} className="space-y-4">
              <div>
                <label className="label">6-Digit OTP</label>
                <input
                  className="input-field text-center text-2xl font-mono tracking-widest"
                  maxLength={8}
                  placeholder="······"
                  title="Enter the OTP sent to your email"
                  {...regOtp('otp', { validate: validateOtp })} />
                {eOtp.otp && (
                  <p className="text-xs text-red-500 mt-1">
                    {String((eOtp.otp.message as any)?.message ?? eOtp.otp.message)}
                  </p>
                )}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying…' : 'Verify & Continue'}
              </button>
              <button type="button" onClick={() => authAPI.sendOtp({ email }).then(() => toast.success('OTP resent'))}
                className="btn-ghost w-full text-xs">
                Resend OTP
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--brand)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
