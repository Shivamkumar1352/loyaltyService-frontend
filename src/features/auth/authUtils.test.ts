import { describe, expect, it } from 'vitest'
import {
  normalizeIdentifier,
  validateEmail,
  validateIdentifier,
  validateOtp,
  validatePassword,
  validatePhone,
} from './authUtils'

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

describe('auth validators', () => {
  it('accepts valid email and phone identifiers', () => {
    expect(validateIdentifier('user@example.com')).toBe(true)
    expect(validateIdentifier('+91 9876543210')).toBe(true)
  })

  it('rejects invalid identifiers', () => {
    expect(validateIdentifier('')).toBe('Email or phone required')
    expect(validateIdentifier('not-an-id')).toBe('Enter a valid email address or phone number')
    expect(validateIdentifier('user@example')).toBe('Enter a valid email address')
  })

  it('validates email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('bad-email')).toBe('Enter a valid email address')
  })

  it('validates phone numbers', () => {
    expect(validatePhone('9876543210')).toBe(true)
    expect(validatePhone('+91 9876543210')).toBe(true)
    expect(validatePhone('12345')).toBe('Enter a valid phone number')
  })

  it('validates password complexity', () => {
    expect(validatePassword('Abcd123!')).toBe(true)
    expect(validatePassword('')).toBe('Password required')
    expect(validatePassword('abc123!')).toBe('Min 8 characters')
    expect(validatePassword('abcdefgh')).toBe('Need upper, lower, number & symbol')
  })

  it('validates otp format', () => {
    expect(validateOtp('1234')).toBe(true)
    expect(validateOtp('12345678')).toBe(true)
    expect(validateOtp('12ab')).toBe('OTP must be 4 to 8 digits')
  })
})
