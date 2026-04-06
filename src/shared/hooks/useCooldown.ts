import { useCallback, useEffect, useMemo, useState } from 'react'

export function useCooldown() {
  const [expiresAt, setExpiresAt] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (expiresAt <= now) return

    const timerId = window.setInterval(() => {
      setNow(Date.now())
    }, 250)

    return () => window.clearInterval(timerId)
  }, [expiresAt, now])

  const start = useCallback((durationMs: number) => {
    const nextExpiry = Date.now() + durationMs
    setNow(Date.now())
    setExpiresAt(nextExpiry)
  }, [])

  const clear = useCallback(() => {
    setNow(Date.now())
    setExpiresAt(0)
  }, [])

  const remainingMs = Math.max(0, expiresAt - now)
  const remainingSeconds = useMemo(() => Math.ceil(remainingMs / 1000), [remainingMs])

  return {
    isCoolingDown: remainingMs > 0,
    remainingMs,
    remainingSeconds,
    start,
    clear,
  }
}
