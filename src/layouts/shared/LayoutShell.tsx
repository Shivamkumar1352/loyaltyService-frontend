import type { ReactNode } from 'react'

type LayoutShellProps = {
  children: ReactNode
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="flex min-h-screen min-h-[100dvh] overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {children}
    </div>
  )
}
