import type { ReactNode } from 'react'

type LayoutShellProps = {
  children: ReactNode
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="flex h-screen min-h-screen min-h-[100dvh] overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      {children}
    </div>
  )
}
