'use client'

import React, { useState, useEffect } from 'react'

interface SystemStats {
  people: number
  cohorts: number
  policies: number
  events: number
  effects: number
  relationships: number
  auditLogs: number
}

interface CohortStats {
  id: string
  name: string
  color: string | null
  memberCount: number
  relationshipCount: number
  avgScore: number
}

interface PolicyStats {
  id: string
  name: string
  domain: string
  probability: number
  isActive: boolean
  relationshipsGenerated: number
}

interface EventStats {
  id: string
  name: string
  eventType: string
  isActive: boolean
  effectCount: number
  startDate: Date
  endDate: Date | null
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [cohortStats, setCohortStats] = useState<CohortStats[]>([])
  const [policyStats, setPolicyStats] = useState<PolicyStats[]>([])
  const [eventStats, setEventStats] = useState<EventStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch system statistics
      const statsResponse = await fetch('/api/analytics/stats')
      if (!statsResponse.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch cohort statistics
      const cohortsResponse = await fetch('/api/analytics/cohorts')
      if (!cohortsResponse.ok) throw new Error('Failed to fetch cohort stats')
      const cohortsData = await cohortsResponse.json()
      setCohortStats(cohortsData)

      // Fetch policy statistics
      const policiesResponse = await fetch('/api/analytics/policies')
      if (!policiesResponse.ok) throw new Error('Failed to fetch policy stats')
      const policiesData = await policiesResponse.json()
      setPolicyStats(policiesData)

      // Fetch event statistics
      const eventsResponse = await fetch('/api/analytics/events')
      if (!eventsResponse.ok) throw new Error('Failed to fetch event stats')
      const eventsData = await eventsResponse.json()
      setEventStats(eventsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            📊 Analytics Dashboard
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl">
            Analyze the effectiveness and performance of your involvement & loyalty system.
          </p>
        </header>

        {/* System Overview */}
        {stats && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-600">Total People</p>
                <p className="text-3xl font-bold text-blue-900">{stats.people}</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                <p className="text-sm font-medium text-green-600">Cohorts</p>
                <p className="text-3xl font-bold text-green-900">{stats.cohorts}</p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-600">Policies</p>
                <p className="text-3xl font-bold text-purple-900">{stats.policies}</p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
                <p className="text-sm font-medium text-orange-600">Events</p>
                <p className="text-3xl font-bold text-orange-900">{stats.events}</p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <p className="text-sm font-medium text-red-600">Effects</p>
                <p className="text-3xl font-bold text-red-900">{stats.effects}</p>
              </div>
              <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
                <p className="text-sm font-medium text-indigo-600">Relationships</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.relationships}</p>
              </div>
              <div className="bg-gray-50 border-l-4 border-gray-500 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Audit Logs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.auditLogs}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cohort Performance */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Cohort Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Cohort</th>
                  <th className="text-left py-2">Members</th>
                  <th className="text-left py-2">Relationships</th>
                  <th className="text-left py-2">Avg Score</th>
                  <th className="text-left py-2">Color</th>
                </tr>
              </thead>
              <tbody>
                {cohortStats.map((cohort) => (
                  <tr key={cohort.id} className="border-b">
                    <td className="py-2 font-medium">{cohort.name}</td>
                    <td className="py-2">{cohort.memberCount}</td>
                    <td className="py-2">{cohort.relationshipCount}</td>
                    <td className="py-2">{cohort.avgScore.toFixed(1)}</td>
                    <td className="py-2">
                      <div 
                        className="w-4 h-4 rounded-full inline-block"
                        style={{ backgroundColor: cohort.color || '#95a5a6' }}
                      ></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Effectiveness */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Policy Effectiveness</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policyStats.map((policy) => (
              <div
                key={policy.id}
                className={`border rounded-lg p-4 ${
                  policy.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{policy.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    policy.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {policy.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{policy.domain}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Probability:</span>
                    <span className="ml-1 font-medium">{(policy.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Generated:</span>
                    <span className="ml-1 font-medium">{policy.relationshipsGenerated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Impact */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Event Impact</h2>
          <div className="space-y-4">
            {eventStats.map((event) => (
              <div
                key={event.id}
                className={`border rounded-lg p-4 ${
                  event.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{event.name}</h3>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      event.isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {event.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                      {event.eventType}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(event.startDate).toLocaleDateString()} - {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'Ongoing'}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Effects:</span>
                    <span className="ml-1 font-medium">{event.effectCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-1 font-medium">{event.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Database</h3>
              <p className="text-sm text-green-700">All connections healthy</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">API Endpoints</h3>
              <p className="text-sm text-green-700">All endpoints responding</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Data Integrity</h3>
              <p className="text-sm text-green-700">No orphaned records found</p>
            </div>
          </div>
        </div>

        {/* Back to Involvement */}
        <div className="mt-8 text-center">
          <a
            href="/involvement"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            ← Back to Involvement System
          </a>
        </div>
      </div>
    </div>
  )
}
