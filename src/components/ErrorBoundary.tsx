'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-amber-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-amber-700 mb-6">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        {error && (
          <details className="text-left bg-red-50 border border-red-200 rounded p-4 mb-6">
            <summary className="cursor-pointer text-red-800 font-medium">
              Error Details
            </summary>
            <pre className="text-xs text-red-600 mt-2 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        <div className="space-x-4">
          <button
            onClick={resetError}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorBoundary
