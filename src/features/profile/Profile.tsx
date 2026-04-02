import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { userAPI, kycAPI } from '../../core/api'
import { useAuthStore } from '../../store'
import { fmt } from '../../shared/utils'
import { Skeleton } from '../../shared/components'
import toast from 'react-hot-toast'

const KYC_STATUS_UI = {
  APPROVED:      { icon: <CheckCircle size={16} />, color: '#16b36e', bg: 'rgba(22,179,110,0.1)',  label: 'KYC Approved' },
  PENDING:       { icon: <Clock size={16} />,       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Under Review' },
  REJECTED:      { icon: <XCircle size={16} />,     color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Rejected' },
  NOT_SUBMITTED: { icon: <AlertCircle size={16} />, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', label: 'Not Submitted' },
}

const DOC_TYPES = ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE']

export default function Profile() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [kycStatus, setKycStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [kycFile, setKycFile] = useState(null)
  const [kycDocType, setKycDocType] = useState('AADHAAR')
  const [kycDocNum, setKycDocNum] = useState('')
  const [submittingKyc, setSubmittingKyc] = useState(false)
  const [tab, setTab] = useState('profile')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [p, k] = await Promise.allSettled([userAPI.getProfile(), kycAPI.getStatus()])
      if (p.status === 'fulfilled') {
        const data = p.value.data?.data
        setProfile(data)
        reset({ name: data.name, phone: data.phone })
      }
      if (k.status === 'fulfilled') setKycStatus(k.value.data?.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onSaveProfile = async (data) => {
    setSaving(true)
    try {
      const res = await userAPI.updateProfile(data)
      const updated = res.data?.data
      setProfile(updated)
      setAuth({ ...user, name: updated.name, phone: updated.phone }, accessToken, refreshToken)
      toast.success('Profile updated!')
      setEditMode(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const onSubmitKyc = async () => {
    if (!kycFile) return toast.error('Please select a document file')
    if (!kycDocNum) return toast.error('Enter document number')
    setSubmittingKyc(true)
    try {
      const fd = new FormData()
      fd.append('docFile', kycFile)
      const res = await kycAPI.submit(fd, kycDocType, kycDocNum)
      setKycStatus(res.data?.data)
      toast.success('KYC submitted! Under review.')
      setKycFile(null)
      setKycDocNum('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'KYC submission failed')
    } finally { setSubmittingKyc(false) }
  }

  const kycUi = KYC_STATUS_UI[kycStatus?.status || 'NOT_SUBMITTED']

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Profile & KYC</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your account details</p>
      </div>

      {/* Avatar + KYC badge */}
      <div className="card p-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-dark))' }}>
            {fmt.initials(user?.fullName || user?.name || 'U')}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {loading ? <Skeleton className="h-6 w-40 mb-2" /> : (
            <p className="text-xl font-black truncate" style={{ color: 'var(--text-primary)' }}>
              {profile?.name || user?.fullName}
            </p>
          )}
          <p className="text-sm truncate mb-2" style={{ color: 'var(--text-muted)' }}>{profile?.email || user?.email}</p>
          <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
            style={{ background: kycUi.bg, color: kycUi.color }}>
            {kycUi.icon} {kycUi.label}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
        {[['profile', 'Profile Details'], ['kyc', 'KYC Verification']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === val
              ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
              : { color: 'var(--text-muted)' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card p-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i}><Skeleton className="h-3 w-20 mb-2" /><Skeleton className="h-10 rounded-xl" /></div>)}
            </div>
          ) : editMode ? (
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" {...register('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" type="tel"
                  {...register('phone', { required: 'Required', minLength: { value: 10, message: 'Min 10 digits' } })} />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input-field opacity-60 cursor-not-allowed" value={profile?.email || ''} disabled />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Email cannot be changed</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                ['Full Name', profile?.name],
                ['Email', profile?.email],
                ['Phone', profile?.phone],
                ['Status', profile?.status],
                ['Member since', fmt.date(profile?.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{v || '—'}</span>
                </div>
              ))}
              <button onClick={() => setEditMode(true)} className="btn-primary w-full mt-2">Edit Profile</button>
            </div>
          )}
        </div>
      )}

      {/* KYC Tab */}
      {tab === 'kyc' && (
        <div className="space-y-4">
          {/* Current status */}
          <div className="card p-5">
            <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Verification Status</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: kycUi.bg, color: kycUi.color }}>
                {kycUi.icon}
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: kycUi.color }}>{kycUi.label}</p>
                {kycStatus?.docType && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {kycStatus.docType} · {kycStatus.docNumber} · Submitted {fmt.date(kycStatus.submittedAt)}
                  </p>
                )}
                {kycStatus?.rejectionReason && (
                  <p className="text-xs text-red-500 mt-0.5">Reason: {kycStatus.rejectionReason}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit form */}
          {(!kycStatus?.status || kycStatus.status === 'NOT_SUBMITTED' || kycStatus.status === 'REJECTED') && (
            <div className="card p-5 space-y-4">
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {kycStatus?.status === 'REJECTED' ? 'Re-submit KYC' : 'Submit KYC Documents'}
              </p>
              <div>
                <label className="label">Document Type</label>
                <select className="input-field" value={kycDocType} onChange={e => setKycDocType(e.target.value)}>
                  {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Document Number</label>
                <input className="input-field" placeholder="Enter document number"
                  value={kycDocNum} onChange={e => setKycDocNum(e.target.value)} />
              </div>
              <div>
                <label className="label">Upload Document</label>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl p-6 cursor-pointer transition-all"
                  style={{ border: '2px dashed var(--border)', background: kycFile ? 'rgba(22,179,110,0.05)' : 'var(--bg-tertiary)' }}>
                  <Upload size={24} style={{ color: kycFile ? 'var(--brand)' : 'var(--text-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: kycFile ? 'var(--brand)' : 'var(--text-muted)' }}>
                    {kycFile ? kycFile.name : 'Click to upload (PDF, JPG, PNG)'}
                  </span>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setKycFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <button onClick={onSubmitKyc} disabled={submittingKyc || !kycFile || !kycDocNum}
                className="btn-primary w-full">
                {submittingKyc ? 'Submitting…' : 'Submit for Verification'}
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                Your documents are encrypted and securely stored.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
