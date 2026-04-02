export function normalizeIdentifier(raw: string) {
  const v = (raw || '').trim()
  const phone = v.replace(/[^\d]/g, '')
  const isEmail = v.includes('@')
  const isPhone = !isEmail && phone.length >= 10
  return { raw: v, phone, isEmail, isPhone }
}

