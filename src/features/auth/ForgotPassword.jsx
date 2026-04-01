import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { authAPI } from '../../core/api'
import toast from 'react-hot-toast'

const STEPS = ['email', 'otp', 'reset']

export default function ForgotPassword() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register: r1, handleSubmit: hs1, formState: { errors: e1 } } = useForm()
  const { register: r2, handleSubmit: hs2, formState: { errors: e2 } } = useForm()
  const { register: r3, handleSubmit: hs3, watch: w3, formState: { errors: e3 } } = useForm()

  const sendOtp = async (data) => {
    setLoading(true)
    try {
      await authAPI.forgotPasswordSendOtp({ email: data.email })
      setEmail(data.email)
      toast.success('OTP sent to your email')
      setStep(1)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const verifyOtp = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.forgotPasswordVerifyOtp({ email, otp: data.otp })
      setResetToken(res.data.resetToken)
      toast.success('OTP verified!')
      setStep(2)
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  const resetPassword = async (data) => {
    setLoading(true)
    try {
      await authAPI.resetPassword({ resetToken, newPassword: data.newPassword })
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) { toast.error(err.response?.data?.message || 'Reset failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to login
        </Link>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? 'var(--brand)' : 'var(--border)' }} />
          ))}
        </div>

        <h2 className="font-black text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          {step === 0 ? 'Forgot password?' : step === 1 ? 'Enter OTP' : 'New password'}
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {step === 0 && "We'll send an OTP to your registered email."}
          {step === 1 && `Check your inbox at ${email}`}
          {step === 2 && 'Choose a strong new password.'}
        </p>

        {step === 0 && (
          <form onSubmit={hs1(sendOtp)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com"
                {...r1('email', { required: 'Email required' })} />
              {e1.email && <p className="text-xs text-red-500 mt-1">{e1.email.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={hs2(verifyOtp)} className="space-y-4">
            <div>
              <label className="label">One-Time Password</label>
              <input className="input-field text-center text-2xl font-mono tracking-widest"
                maxLength={8} placeholder="······"
                {...r2('otp', { required: 'OTP required' })} />
              {e2.otp && <p className="text-xs text-red-500 mt-1">{e2.otp.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button type="button" className="btn-ghost w-full text-xs"
              onClick={() => authAPI.forgotPasswordSendOtp({ email }).then(() => toast.success('OTP resent'))}>
              Resend OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={hs3(resetPassword)} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={showPwd ? 'text' : 'password'} placeholder="Min 8 chars"
                  {...r3('newPassword', {
                    required: 'Required',
                    minLength: { value: 8, message: 'Min 8 chars' },
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, message: 'Need upper, lower, number & symbol' }
                  })} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {e3.newPassword && <p className="text-xs text-red-500 mt-1">{e3.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input className="input-field" type="password" placeholder="Re-enter"
                {...r3('confirm', { required: 'Required', validate: v => v === w3('newPassword') || 'Passwords do not match' })} />
              {e3.confirm && <p className="text-xs text-red-500 mt-1">{e3.confirm.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
