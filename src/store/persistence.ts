import type { PersistEnvelope } from './types'

export function readPersistedState<T>(key: string): T | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return undefined
    return (JSON.parse(raw) as PersistEnvelope<T>)?.state
  } catch {
    return undefined
  }
}

export function writePersistedState<T>(key: string, state: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify({ state }))
  } catch {}
}

export function applyThemeClass(isDark: boolean) {
  if (typeof document === 'undefined') return
  if (isDark) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}
