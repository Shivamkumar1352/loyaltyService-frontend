export function normalizeIdentifier(raw: string) {
  const v = (raw || '').trim()
  const phone = v.replace(/[^\d]/g, '')
  const isEmail = v.includes('@')
  const isPhone = !isEmail && phone.length >= 10
  return { raw: v, phone, isEmail, isPhone }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^(?:\+?\d{1,3}[\s-]?)?\d{10}$/
const OTP_PATTERN = /^\d{4,8}$/
const PASSWORD_COMPLEXITY_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/

export function validateIdentifier(value: string) {
  const { raw, isEmail, isPhone } = normalizeIdentifier(value)

  if (!raw) return 'Email or phone required'
  if (isEmail) return EMAIL_PATTERN.test(raw) || 'Enter a valid email address'
  if (isPhone) return true

  return 'Enter a valid email address or phone number'
}

export function validateEmail(value: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'Email required'
  return EMAIL_PATTERN.test(trimmed) || 'Enter a valid email address'
}

export function validatePhone(value: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'Phone required'
  return PHONE_PATTERN.test(trimmed) || 'Enter a valid phone number'
}

export function validatePassword(value: string) {
  if (!value) return 'Password required'
  if (value.length < 8) return 'Min 8 characters'
  return PASSWORD_COMPLEXITY_PATTERN.test(value) || 'Need upper, lower, number & symbol'
}

export function validateOtp(value: string) {
  const trimmed = (value || '').trim()
  if (!trimmed) return 'OTP required'
  return OTP_PATTERN.test(trimmed) || 'OTP must be 4 to 8 digits'
}
