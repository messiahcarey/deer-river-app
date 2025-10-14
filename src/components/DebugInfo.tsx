'use client'

import { useEffect, useState } from 'react'

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState({
    userAgent: '',
    url: '',
    timestamp: '',
    errorCount: 0
  })

  useEffect(() => {
    setDebugInfo({
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      errorCount: 0
    })

    // Monitor for errors
    const handleError = () => {
      setDebugInfo(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
      <div>Debug Info:</div>
      <div>URL: {debugInfo.url}</div>
      <div>Time: {debugInfo.timestamp}</div>
      <div>Errors: {debugInfo.errorCount}</div>
    </div>
  )
}
