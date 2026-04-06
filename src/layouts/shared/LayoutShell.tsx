import type { ReactNode } from 'react'

type LayoutShellProps = {
  children: ReactNode
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {children}
    </div>
  )
}
