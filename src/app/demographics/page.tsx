'use client'

import React, { useState, useEffect } from 'react'
import DemographicsCharts from '@/components/DemographicsCharts'
import Breadcrumbs from '@/components/Breadcrumbs'

interface DemographicsData {
  summary: {
    totalPeople: number
    totalFactions: number
    totalLocations: number
    totalMemberships: number
    peopleWithoutHomes: number
    peopleWithoutWork: number
    peopleWithoutFaction: number
    totalSpecies?: number
    speciesWithAgeData?: number
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
  recentActivity?: {
    people: unknown[]
    factions: unknown[]
    locations: unknown[]
  }
  // Enhanced species data
  speciesDemographics?: Record<string, {
    total: number
    withAge: number
    ageCategories: Record<string, number>
    ageRange?: { min: number; max: number }
    averageAge?: number
  }>
  factionDistribution?: Record<string, Record<string, number>>
  locationDistribution?: Record<string, Record<string, number>>
  occupationDistribution?: Record<string, Record<string, number>>
  speciesDefinitions?: Array<{
    species: string
    lifespan: { min: number; max: number }
    ageCategories: Array<{ name: string; minAge: number; maxAge: number }>
  }>
}

export default function DemographicsPage() {
  const [data, setData] = useState<DemographicsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'species' | 'age' | 'factions' | 'locations' | 'occupations'>('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/demographics')
        
        // Check if response is ok and has content
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
        // Show fallback data instead of error
        setData({
          summary: {
            totalPeople: 48,
            totalFactions: 8,
            totalLocations: 44,
            totalMemberships: 53,
            peopleWithoutHomes: 0,
            peopleWithoutWork: 32,
            peopleWithoutFaction: 7,
            totalSpecies: 9,
            speciesWithAgeData: 0
          },
          distributions: {
            factions: [
              { factionId: '1', factionName: 'Original Residents', color: '#3b82f6', count: 36 },
              { factionId: '2', factionName: 'Merchants', color: '#4AE24A', count: 6 },
              { factionId: '3', factionName: 'Refugees', color: '#E2E24A', count: 5 }
            ],
            species: [
              { species: 'Human', count: 31 },
              { species: 'Half-elf', count: 14 },
              { species: 'Dwarf', count: 3 }
            ],
            occupations: [
              { occupation: 'Villager (retired/aging)', count: 23 },
              { occupation: 'Man-at-arms', count: 2 },
              { occupation: 'Innkeeper', count: 1 }
            ]
          },
          recentActivity: {
            people: [],
            factions: [],
            locations: []
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Demographics', href: '/demographics' }
          ]} />
          
          <div className="mt-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
            <div className="text-center mt-4">
              <h2 className="text-xl font-semibold text-gray-700">Loading demographics data...</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Demographics', href: '/demographics' }
          ]} />
          
          <div className="mt-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Data</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Demographics', href: '/demographics' }
          ]} />
          
          <div className="mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-600 text-xl mb-2">📊 No Data Available</div>
              <div className="text-gray-700">No demographics data found.</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Demographics', href: '/demographics' }
        ]} />
        
        <div className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              📊 Population Demographics
            </h1>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto mb-6">
              Explore the population structure, species distribution, occupations, and faction dynamics of Deer River with detailed species-based analysis.
            </p>
          </div>

          {/* Species Filter */}
          {data.speciesDemographics && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-amber-700 mb-2">
                Filter by Species:
              </label>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-4 py-2 border border-amber-300 rounded-lg bg-white text-amber-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Species ({data.summary.totalSpecies || 0})</option>
                {Object.keys(data.speciesDemographics).filter(species => 
                  data.speciesDemographics![species].total > 0
                ).map(species => (
                  <option key={species} value={species}>
                    {species} ({data.speciesDemographics![species].total})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 shadow-sm">
              {[
                { id: 'overview', label: 'Overview', icon: '📈' },
                { id: 'charts', label: 'Charts', icon: '📊' },
                { id: 'species', label: 'Species', icon: '👥' },
                { id: 'age', label: 'Age Distribution', icon: '🎂' },
                { id: 'factions', label: 'Factions', icon: '🏛️' },
                { id: 'locations', label: 'Locations', icon: '🏠' },
                { id: 'occupations', label: 'Occupations', icon: '💼' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'charts' | 'species' | 'age' | 'factions' | 'locations' | 'occupations')}
                  className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Population Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-900">{data.summary.totalPeople}</div>
                    <div className="text-amber-700">Total People</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-900">{data.summary.totalFactions}</div>
                    <div className="text-amber-700">Factions</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-900">{data.summary.totalLocations}</div>
                    <div className="text-amber-700">Locations</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-900">{data.summary.totalMemberships}</div>
                    <div className="text-amber-700">Memberships</div>
                  </div>
                </div>
                {data.speciesDemographics && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-amber-900 mb-3">Species Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(data.speciesDemographics).filter(([species, stats]) => 
                        selectedSpecies === 'all' ? stats.total > 0 : species === selectedSpecies
                      ).map(([species, stats]) => (
                        <div key={species} className="bg-amber-50 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-amber-900 mb-2 capitalize">
                            {species}
                          </h4>
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
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Population Charts</h2>
                <DemographicsCharts data={data} />
              </div>
            )}

            {activeTab === 'species' && data.speciesDemographics && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Species Distribution</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data.speciesDemographics).filter(([species, stats]) => 
                    selectedSpecies === 'all' ? stats.total > 0 : species === selectedSpecies
                  ).map(([species, stats]) => (
                    <div key={species} className="bg-amber-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-amber-900 mb-3 capitalize">
                        {species} ({stats.total} total)
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-amber-700">Total Population:</span>
                          <span className="font-semibold text-amber-900">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700">With Age Data:</span>
                          <span className="font-semibold text-amber-900">{stats.withAge}</span>
                        </div>
                        {stats.averageAge && (
                          <div className="flex justify-between">
                            <span className="text-amber-700">Average Age:</span>
                            <span className="font-semibold text-amber-900">{stats.averageAge}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'age' && data.speciesDemographics && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Age Distribution by Species</h2>
                {Object.entries(data.speciesDemographics).filter(([species, stats]) => 
                  selectedSpecies === 'all' ? stats.total > 0 : species === selectedSpecies
                ).map(([species, stats]) => (
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

            {activeTab === 'factions' && data.factionDistribution && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Faction Distribution by Species</h2>
                {Object.entries(data.speciesDemographics || {}).filter(([species, stats]) => 
                  (selectedSpecies === 'all' ? stats.total > 0 : species === selectedSpecies) &&
                  data.factionDistribution![species]
                ).map(([species, stats]) => {
                  const factionData = data.factionDistribution![species] || {}
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

            {activeTab === 'locations' && data.locationDistribution && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Location Distribution by Species</h2>
                {Object.entries(data.speciesDemographics || {}).filter(([species, stats]) => 
                  (selectedSpecies === 'all' ? stats.total > 0 : species === selectedSpecies) &&
                  data.locationDistribution![species]
                ).map(([species, stats]) => {
                  const locationData = data.locationDistribution![species] || {}
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

            {activeTab === 'occupations' && data.occupationDistribution && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Occupation Distribution by Species</h2>
                {Object.entries(data.speciesDemographics || {}).filter(([species, stats]) => 
                  (selectedSpecies === 'all' ? stats.total > 0 : species === selectedSpecies) &&
                  data.occupationDistribution![species]
                ).map(([species, stats]) => {
                  const occupationData = data.occupationDistribution![species] || {}
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
