'use client'

import React, { useState, useEffect } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'
import { SPECIES_DEMOGRAPHICS, getAgeCategory } from '@/lib/demographics'

interface DemographicsData {
  summary: {
    totalPeople: number
    totalSpecies: number
    speciesWithAgeData: number
  }
  speciesDemographics: Record<string, {
    total: number
    withAge: number
    ageCategories: Record<string, number>
    ageRange?: { min: number; max: number }
    averageAge?: number
  }>
  factionDistribution: Record<string, Record<string, number>>
  locationDistribution: Record<string, Record<string, number>>
  occupationDistribution: Record<string, Record<string, number>>
  speciesDefinitions: Array<{
    species: string
    lifespan: { min: number; max: number }
    ageCategories: Array<{ name: string; minAge: number; maxAge: number }>
  }>
  rawData: {
    people: Array<{
      id: string
      name: string
      species: string
      age?: number
      occupation?: string
    }>
  }
}

export default function DemographicsEnhancedPage() {
  const [data, setData] = useState<DemographicsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'age' | 'factions' | 'locations' | 'occupations'>('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/demographics')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const text = await response.text()
        if (!text || text.trim() === '') {
          throw new Error('Empty response from server')
        }

        const result = JSON.parse(text)

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch demographics data')
        }
      } catch (err) {
        console.error('Demographics API error:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-lg text-amber-700">Loading demographics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Data</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-amber-600 mb-2">No Data Available</h1>
          <p className="text-amber-500">Unable to load demographics data</p>
        </div>
      </div>
    )
  }

  const speciesList = Object.keys(data.speciesDemographics).filter(species => 
    data.speciesDemographics[species].total > 0
  )

  const selectedSpeciesData = selectedSpecies === 'all' 
    ? data.speciesDemographics 
    : { [selectedSpecies]: data.speciesDemographics[selectedSpecies] }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Demographics', href: '/demographics' },
          { label: 'Enhanced', href: '/demographics-enhanced' }
        ]} />

        <div className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              📊 Enhanced Demographics by Species
            </h1>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Detailed population analysis grouped by species with age categories, faction distribution, and more.
            </p>
          </div>

          {/* Species Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-700 mb-2">
              Filter by Species:
            </label>
            <select
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              className="px-4 py-2 border border-amber-300 rounded-lg bg-white text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">All Species ({data.summary.totalSpecies})</option>
              {speciesList.map(species => (
                <option key={species} value={species}>
                  {species} ({data.speciesDemographics[species].total})
                </option>
              ))}
            </select>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              {[
                { id: 'overview', label: 'Overview', icon: '📈' },
                { id: 'age', label: 'Age Distribution', icon: '🎂' },
                { id: 'factions', label: 'Factions', icon: '🏛️' },
                { id: 'locations', label: 'Locations', icon: '🏠' },
                { id: 'occupations', label: 'Occupations', icon: '💼' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Species Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedSpeciesData).map(([species, stats]) => (
                    <div key={species} className="bg-amber-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-amber-900 mb-2 capitalize">
                        {species}
                      </h3>
                      <div className="space-y-1 text-sm text-amber-700">
                        <p><strong>Total:</strong> {stats.total}</p>
                        <p><strong>With Age Data:</strong> {stats.withAge}</p>
                        {stats.averageAge && (
                          <p><strong>Average Age:</strong> {stats.averageAge}</p>
                        )}
                        {stats.ageRange && (
                          <p><strong>Age Range:</strong> {stats.ageRange.min}-{stats.ageRange.max}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'age' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Age Distribution by Species</h2>
                {Object.entries(selectedSpeciesData).map(([species, stats]) => (
                  <div key={species} className="bg-amber-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-amber-900 mb-3 capitalize">
                      {species} ({stats.total} total)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {Object.entries(stats.ageCategories).map(([category, count]) => (
                        <div key={category} className="bg-white rounded p-2 text-center">
                          <div className="text-sm font-medium text-amber-600">{category}</div>
                          <div className="text-lg font-bold text-amber-900">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'factions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Faction Distribution by Species</h2>
                {Object.entries(selectedSpeciesData).map(([species, stats]) => {
                  const factionData = data.factionDistribution[species] || {}
                  return (
                    <div key={species} className="bg-amber-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-amber-900 mb-3 capitalize">
                        {species} ({stats.total} total)
                      </h3>
                      {Object.keys(factionData).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(factionData).map(([faction, count]) => (
                            <div key={faction} className="bg-white rounded p-2">
                              <div className="text-sm font-medium text-amber-600">{faction}</div>
                              <div className="text-lg font-bold text-amber-900">{count}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-amber-600 italic">No faction memberships</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Location Distribution by Species</h2>
                {Object.entries(selectedSpeciesData).map(([species, stats]) => {
                  const locationData = data.locationDistribution[species] || {}
                  return (
                    <div key={species} className="bg-amber-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-amber-900 mb-3 capitalize">
                        {species} ({stats.total} total)
                      </h3>
                      {Object.keys(locationData).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(locationData).map(([location, count]) => (
                            <div key={location} className="bg-white rounded p-2">
                              <div className="text-sm font-medium text-amber-600">{location}</div>
                              <div className="text-lg font-bold text-amber-900">{count}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-amber-600 italic">No location data</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {activeTab === 'occupations' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Occupation Distribution by Species</h2>
                {Object.entries(selectedSpeciesData).map(([species, stats]) => {
                  const occupationData = data.occupationDistribution[species] || {}
                  return (
                    <div key={species} className="bg-amber-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-amber-900 mb-3 capitalize">
                        {species} ({stats.total} total)
                      </h3>
                      {Object.keys(occupationData).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {Object.entries(occupationData).map(([occupation, count]) => (
                            <div key={occupation} className="bg-white rounded p-2">
                              <div className="text-sm font-medium text-amber-600">{occupation}</div>
                              <div className="text-lg font-bold text-amber-900">{count}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-amber-600 italic">No occupation data</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
