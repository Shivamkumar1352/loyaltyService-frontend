import { useEffect, useRef, useState } from 'react'

export function useThrottledValue<T>(value: T, delayMs = 800) {
  const [throttled, setThrottled] = useState(value)
  const lastRunRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastRunRef.current

    if (elapsed >= delayMs) {
      lastRunRef.current = now
      setThrottled(value)
      return
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      lastRunRef.current = Date.now()
      setThrottled(value)
      timeoutRef.current = null
    }, delayMs - elapsed)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [delayMs, value])

  return throttled
}
