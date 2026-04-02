import { describe, expect, it } from 'vitest'
import { normalizeIdentifier } from './authUtils'

describe('normalizeIdentifier', () => {
  it('detects email', () => {
    const r = normalizeIdentifier('  user@example.com ')
    expect(r.raw).toBe('user@example.com')
    expect(r.isEmail).toBe(true)
    expect(r.isPhone).toBe(false)
  })

  it('detects phone and strips formatting', () => {
    const r = normalizeIdentifier('+91 98765-43210')
    expect(r.phone).toBe('919876543210')
    expect(r.isEmail).toBe(false)
    expect(r.isPhone).toBe(true)
  })
})

