import { useEffect, useCallback } from 'react'

interface UseAutoRefreshOptions {
  refreshFunction: () => Promise<void>
  onError?: (error: Error) => void
  maxRetries?: number
  retryDelay?: number
}

export function useAutoRefresh({
  refreshFunction,
  onError,
  maxRetries = 3,
  retryDelay = 1000
}: UseAutoRefreshOptions) {
  const refreshWithRetry = useCallback(async (retryCount = 0) => {
    try {
      await refreshFunction()
    } catch (error) {
      console.error(`Refresh attempt ${retryCount + 1} failed:`, error)
      
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`)
        setTimeout(() => {
          refreshWithRetry(retryCount + 1)
        }, retryDelay)
      } else {
        console.error('Max retries reached, refresh failed')
        if (onError) {
          onError(error as Error)
        }
      }
    }
  }, [refreshFunction, onError, maxRetries, retryDelay])

  // Auto-refresh on focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing data...')
      refreshWithRetry()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshWithRetry])

  // Auto-refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible, refreshing data...')
        refreshWithRetry()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refreshWithRetry])

  return { refreshWithRetry }
}
