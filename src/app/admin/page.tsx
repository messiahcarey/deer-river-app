'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HealthData {
  status: string
  timestamp: string
  uptime: number
  environment: string
  version: string
  checks: {
    database: string
    memory: string
    disk: string
  }
  metrics: {
    responseTime: number
    memoryUsage: {
      rss: number
      heapTotal: number
      heapUsed: number
      external: number
    }
    nodeVersion: string
  }
}

export default function AdminPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHealth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'degraded': return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🔧 Admin Dashboard
          </h1>
          <p className="text-lg text-amber-700">
            Monitor Deer River application health and performance.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">System Status</h2>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {health && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
                    {health.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Environment:</span>
                    <p className="font-medium">{health.environment}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Version:</span>
                    <p className="font-medium">{health.version}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Uptime:</span>
                    <p className="font-medium">{formatUptime(health.uptime)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Response Time:</span>
                    <p className="font-medium">{health.metrics.responseTime}ms</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Health Checks */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Health Checks</h2>
            
            {health && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Database:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    health.checks.database === 'connected' ? 'bg-green-100 text-green-800' :
                    health.checks.database === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {health.checks.database}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Memory:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    health.checks.memory === 'ok' ? 'bg-green-100 text-green-800' :
                    health.checks.memory === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {health.checks.memory}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Disk:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    health.checks.disk === 'ok' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {health.checks.disk}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Memory Usage */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Memory Usage</h2>
            
            {health && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">RSS:</span>
                  <span className="font-medium">{formatBytes(health.metrics.memoryUsage.rss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Heap Total:</span>
                  <span className="font-medium">{formatBytes(health.metrics.memoryUsage.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Heap Used:</span>
                  <span className="font-medium">{formatBytes(health.metrics.memoryUsage.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">External:</span>
                  <span className="font-medium">{formatBytes(health.metrics.memoryUsage.external)}</span>
                </div>
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Information</h2>
            
            {health && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Node Version:</span>
                  <span className="font-medium">{health.metrics.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Check:</span>
                  <span className="font-medium">
                    {new Date(health.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link 
              href="/api/health" 
              target="_blank"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔗 View Raw Health Data
            </Link>
            <Link 
              href="/api/test-db" 
              target="_blank"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🗄️ Test Database
            </Link>
            <Link 
              href="/api/env-test" 
              target="_blank"
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ⚙️ Check Environment
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
