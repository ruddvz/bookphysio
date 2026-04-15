'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Shown when the section crashes. Defaults to a generic message. */
  fallbackTitle?: string
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Wraps a section of the page so that if one component crashes,
 * the rest of the page still renders. Provides a retry button.
 */
export default class SectionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[SectionErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[var(--sq-lg)] border border-amber-200 bg-amber-50/60 p-6 text-center my-6">
          <AlertTriangle size={28} className="mx-auto text-amber-500 mb-3" />
          <p className="text-[14px] font-semibold text-amber-800 mb-1">
            {this.props.fallbackTitle ?? 'Something went wrong loading this section'}
          </p>
          <p className="text-[12px] text-amber-700/70 mb-4">
            The rest of the page should still work. Try refreshing this section.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center gap-1.5 rounded-[var(--sq-xs)] bg-amber-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
