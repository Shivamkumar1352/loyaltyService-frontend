import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('UI ErrorBoundary caught error', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-primary)' }}>
          <div className="w-full max-w-md card p-6 text-center">
            <p className="text-sm font-black mb-1" style={{ color: 'var(--text-primary)' }}>Something went wrong</p>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
              Please refresh the page. If the issue persists, check the console for details.
            </p>
            <button className="btn-primary w-full" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

