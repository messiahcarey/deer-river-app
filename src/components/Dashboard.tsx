'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardData {
  summary: {
    totalPeople: number
    totalFactions: number
    totalLocations: number
    totalMemberships: number
    peopleWithoutHomes: number
    peopleWithoutWork: number
    peopleWithoutFaction: number
  }
  distributions: {
    factions: Array<{
      factionId: string
      factionName: string
      color: string
      count: number
    }>
    species: Array<{
      species: string
      count: number
    }>
    occupations: Array<{
      occupation: string
      count: number
    }>
  }
  recentActivity: {
    people: Array<{
      id: string
      name: string
      species: string
      createdAt: string
    }>
    factions: Array<{
      id: string
      name: string
      createdAt: string
    }>
    locations: Array<{
      id: string
      name: string
      kind: string
      createdAt: string
    }>
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading dashboard: {error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total People</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalPeople}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🏛️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Factions</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalFactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Buildings</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalLocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🔗</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Memberships</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.totalMemberships}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">No Home</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.peopleWithoutHomes}</p>
              <p className="text-xs text-gray-500">Need housing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">No Work</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.peopleWithoutWork}</p>
              <p className="text-xs text-gray-500">Need jobs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <span className="text-2xl">🏛️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">No Faction</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.peopleWithoutFaction}</p>
              <p className="text-xs text-gray-500">Need affiliation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faction Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Faction Distribution</h3>
          <div className="space-y-3">
            {data.distributions.factions.map((faction, index) => (
              <div key={faction.factionId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: faction.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{faction.factionName}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: faction.color,
                        width: `${(faction.count / data.summary.totalPeople) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{faction.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Species Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Species Distribution</h3>
          <div className="space-y-3">
            {data.distributions.species.slice(0, 8).map((species, index) => (
              <div key={species.species} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{species.species}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ 
                        width: `${(species.count / data.summary.totalPeople) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{species.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity (Last 7 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Recent People */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">New People</h4>
            <div className="space-y-2">
              {data.recentActivity.people.length > 0 ? (
                data.recentActivity.people.map((person) => (
                  <div key={person.id} className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">👤</span>
                    <Link 
                      href={`/people?edit=${person.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {person.name}
                    </Link>
                    <span className="text-gray-400 ml-2">({person.species})</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No new people this week</p>
              )}
            </div>
          </div>

          {/* Recent Factions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">New Factions</h4>
            <div className="space-y-2">
              {data.recentActivity.factions.length > 0 ? (
                data.recentActivity.factions.map((faction) => (
                  <div key={faction.id} className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">🏛️</span>
                    <Link 
                      href={`/factions?edit=${faction.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {faction.name}
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No new factions this week</p>
              )}
            </div>
          </div>

          {/* Recent Locations */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">New Buildings</h4>
            <div className="space-y-2">
              {data.recentActivity.locations.length > 0 ? (
                data.recentActivity.locations.map((location) => (
                  <div key={location.id} className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">🏠</span>
                    <Link 
                      href={`/map?edit=${location.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {location.name}
                    </Link>
                    <span className="text-gray-400 ml-2">({location.kind})</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No new buildings this week</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/people?new=true"
            className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mr-2">👤</span>
            <span className="text-sm font-medium">Add Person</span>
          </Link>
          <Link 
            href="/factions?new=true"
            className="flex items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span className="text-2xl mr-2">🏛️</span>
            <span className="text-sm font-medium">Add Faction</span>
          </Link>
          <Link 
            href="/map?new=true"
            className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="text-2xl mr-2">🏠</span>
            <span className="text-sm font-medium">Add Building</span>
          </Link>
          <Link 
            href="/import"
            className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span className="text-2xl mr-2">📊</span>
            <span className="text-sm font-medium">Import Data</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
