'use client'

import React, { useState } from 'react'

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

interface DemographicsChartsProps {
  data: DemographicsData
}

// Pie Chart Component
const PieChart: React.FC<{
  data: Array<{ label: string; value: number; color: string }>
  title: string
  size?: number
}> = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const startAngle = cumulativePercentage * 3.6 // 3.6 degrees per 1%
              const endAngle = (cumulativePercentage + percentage) * 3.6
              cumulativePercentage += percentage

              const radius = size / 2 - 10
              const x1 = size / 2 + radius * Math.cos((startAngle * Math.PI) / 180)
              const y1 = size / 2 + radius * Math.sin((startAngle * Math.PI) / 180)
              const x2 = size / 2 + radius * Math.cos((endAngle * Math.PI) / 180)
              const y2 = size / 2 + radius * Math.sin((endAngle * Math.PI) / 180)
              const largeArcFlag = percentage > 50 ? 1 : 0

              const pathData = [
                `M ${size / 2} ${size / 2}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">{item.value}</span>
              <span className="text-gray-500">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Bar Chart Component
const BarChart: React.FC<{
  data: Array<{ label: string; value: number; color?: string }>
  title: string
  maxBars?: number
}> = ({ data, title, maxBars = 10 }) => {
  const maxValue = Math.max(...data.map(item => item.value))
  const displayData = data.slice(0, maxBars)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {displayData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 truncate mr-3">
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#3B82F6'
                }}
              >
                <span className="text-white text-xs font-medium">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length > maxBars && (
        <div className="mt-3 text-sm text-gray-500 text-center">
          +{data.length - maxBars} more
        </div>
      )}
    </div>
  )
}

// Enhanced Population Pyramid Component with Species and Age Categories
const PopulationPyramid: React.FC<{
  data: DemographicsData
}> = ({ data }) => {
  // Get age category data with species breakdown
  const getAgeCategoryData = () => {
    if (!data.speciesDemographics) {
      // Fallback to simplified data if no species demographics available
      return [
        { ageCategory: 'Young Adult', species: [{ name: 'All', count: Math.floor(data.summary.totalPeople * 0.3), color: 'bg-blue-500' }] },
        { ageCategory: 'Mature', species: [{ name: 'All', count: Math.floor(data.summary.totalPeople * 0.4), color: 'bg-blue-500' }] },
        { ageCategory: 'Middle Aged', species: [{ name: 'All', count: Math.floor(data.summary.totalPeople * 0.2), color: 'bg-blue-500' }] },
        { ageCategory: 'Old', species: [{ name: 'All', count: Math.floor(data.summary.totalPeople * 0.08), color: 'bg-blue-500' }] },
        { ageCategory: 'Venerable', species: [{ name: 'All', count: Math.floor(data.summary.totalPeople * 0.02), color: 'bg-blue-500' }] }
      ]
    }

    // Group by age categories
    const ageCategories = ['Young Adult', 'Mature', 'Middle Aged', 'Old', 'Venerable']
    const speciesList = Object.entries(data.speciesDemographics)
      .filter(([, stats]) => stats.total > 0)
      .map(([species, stats]) => ({
        name: species.charAt(0).toUpperCase() + species.slice(1),
        total: stats.total
      }))
      .sort((a, b) => b.total - a.total)

    // Generate colors for species
    const speciesColors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-orange-500'
    ]

    return ageCategories.map(ageCategory => {
      const speciesBreakdown = speciesList.map((species, index) => ({
        name: species.name,
        count: data.speciesDemographics![species.name.toLowerCase()]?.ageCategories[ageCategory] || 0,
        color: speciesColors[index % speciesColors.length]
      })).filter(s => s.count > 0)

      return {
        ageCategory,
        species: speciesBreakdown
      }
    })
  }

  const ageCategoryData = getAgeCategoryData()
  const maxCount = Math.max(...ageCategoryData.map(ageCat => 
    ageCat.species.reduce((sum, species) => sum + species.count, 0)
  ))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Population Pyramid by Age Category & Species</h3>
      
      {/* Legend for species colors */}
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {ageCategoryData[0]?.species.map((species, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-3 h-3 rounded ${species.color} mr-1`}></div>
            <span className="text-gray-600">{species.name}</span>
          </div>
        ))}
      </div>

      {/* Age Category Bars */}
      <div className="flex items-end justify-center space-x-4 h-64">
        {ageCategoryData.map((ageCat, ageIndex) => {
          const totalForAge = ageCat.species.reduce((sum, species) => sum + species.count, 0)
          return (
            <div key={ageIndex} className="flex flex-col items-center min-w-0 flex-1 max-w-24">
              {/* Species segments stacked vertically */}
              <div className="flex flex-col-reverse w-full">
                {ageCat.species.map((species, speciesIndex) => {
                  const height = totalForAge > 0 ? (species.count / maxCount) * 200 : 0
                  return (
                    <div
                      key={speciesIndex}
                      className={`${species.color} 
                        flex items-center justify-center text-white text-xs font-medium
                        ${height > 20 ? 'px-1' : 'px-0.5'}
                        ${speciesIndex === 0 ? 'rounded-t-lg' : ''}
                        ${speciesIndex === ageCat.species.length - 1 ? 'rounded-b-lg' : ''}
                        border border-white border-opacity-20`}
                      style={{ 
                        height: `${Math.max(height, 2)}px`,
                        minHeight: species.count > 0 ? '8px' : '2px'
                      }}
                      title={`${species.name}: ${species.count}`}
                    >
                      {height > 20 && species.count > 0 && (
                        <span className="text-xs font-bold">
                          {species.count}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Age category label */}
              <div className="mt-2 text-xs text-gray-600 text-center font-medium">
                {ageCat.ageCategory}
              </div>
              
              {/* Total count */}
              <div className="text-xs text-gray-500 text-center">
                {totalForAge}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Total Population: {data.summary.totalPeople} | 
        Age Categories: 5 | 
        Species: {ageCategoryData[0]?.species.length || 0} represented
      </div>
    </div>
  )
}

// Key Metrics Cards
const KeyMetrics: React.FC<{
  data: DemographicsData
}> = ({ data }) => {
  const metrics = [
    {
      title: 'Total Population',
      value: data.summary.totalPeople,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Factions',
      value: data.summary.totalFactions,
      icon: '🏛️',
      color: 'bg-red-500',
      change: '+2'
    },
    {
      title: 'Buildings',
      value: data.summary.totalLocations,
      icon: '🏠',
      color: 'bg-green-500',
      change: '+5'
    },
    {
      title: 'Unemployed',
      value: data.summary.peopleWithoutWork,
      icon: '💼',
      color: 'bg-yellow-500',
      change: '-3'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-green-600">{metric.change}</p>
            </div>
            <div className={`${metric.color} rounded-full p-3`}>
              <span className="text-white text-xl">{metric.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Main Demographics Charts Component
const DemographicsCharts: React.FC<DemographicsChartsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'species' | 'occupations' | 'factions'>('overview')

  // Handle both old and new data structures
  const getSpeciesData = () => {
    if (data.speciesDemographics) {
      // New structure: convert speciesDemographics to chart format
      return Object.entries(data.speciesDemographics)
        .filter(([, stats]) => stats.total > 0)
        .map(([species, stats], index) => ({
          label: species.charAt(0).toUpperCase() + species.slice(1),
          value: stats.total,
          color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
        }))
    } else if (data.distributions?.species) {
      // Old structure: use distributions.species
      return data.distributions.species.map((item, index) => ({
        label: item.species,
        value: item.count,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      }))
    }
    return []
  }

  const getOccupationData = () => {
    if (data.occupationDistribution) {
      // New structure: convert occupationDistribution to chart format
      const occupationCounts: Record<string, number> = {}
      Object.values(data.occupationDistribution).forEach(speciesOccupations => {
        Object.entries(speciesOccupations).forEach(([occupation, count]) => {
          occupationCounts[occupation] = (occupationCounts[occupation] || 0) + count
        })
      })
      return Object.entries(occupationCounts)
        .map(([occupation, count], index) => ({
          label: occupation,
          value: count,
          color: `hsl(${(index * 137.5 + 120) % 360}, 70%, 50%)`
        }))
        .sort((a, b) => b.value - a.value)
    } else if (data.distributions?.occupations) {
      // Old structure: use distributions.occupations
      return data.distributions.occupations.map((item, index) => ({
        label: item.occupation,
        value: item.count,
        color: `hsl(${(index * 137.5 + 120) % 360}, 70%, 50%)`
      }))
    }
    return []
  }

  const getFactionData = () => {
    if (data.factionDistribution) {
      // New structure: convert factionDistribution to chart format
      const factionCounts: Record<string, number> = {}
      Object.values(data.factionDistribution).forEach(speciesFactions => {
        Object.entries(speciesFactions).forEach(([faction, count]) => {
          factionCounts[faction] = (factionCounts[faction] || 0) + count
        })
      })
      return Object.entries(factionCounts)
        .map(([faction, count], index) => ({
          label: faction,
          value: count,
          color: `hsl(${(index * 137.5 + 240) % 360}, 70%, 50%)`
        }))
        .sort((a, b) => b.value - a.value)
    } else if (data.distributions?.factions) {
      // Old structure: use distributions.factions
      return data.distributions.factions.map((item) => ({
        label: item.factionName,
        value: item.count,
        color: item.color
      }))
    }
    return []
  }

  const speciesData = getSpeciesData()
  const occupationData = getOccupationData()
  const factionData = getFactionData()

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <KeyMetrics data={data} />

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'species', label: 'Species', icon: '🧬' },
            { id: 'occupations', label: 'Jobs', icon: '💼' },
            { id: 'factions', label: 'Factions', icon: '🏛️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'species' | 'occupations' | 'factions')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === 'overview' && (
          <>
            <PopulationPyramid data={data} />
            <PieChart
              data={speciesData.slice(0, 6)}
              title="Species Distribution"
              size={180}
            />
          </>
        )}

        {activeTab === 'species' && (
          <>
            <PieChart
              data={speciesData}
              title="Species Breakdown"
              size={200}
            />
            <BarChart
              data={speciesData}
              title="Species by Count"
              maxBars={8}
            />
          </>
        )}

        {activeTab === 'occupations' && (
          <>
            <BarChart
              data={occupationData}
              title="Most Common Jobs"
              maxBars={10}
            />
            <PieChart
              data={occupationData.slice(0, 6)}
              title="Job Distribution"
              size={180}
            />
          </>
        )}

        {activeTab === 'factions' && (
          <>
            <PieChart
              data={factionData}
              title="Faction Membership"
              size={200}
            />
            <BarChart
              data={factionData}
              title="Faction Sizes"
              maxBars={8}
            />
          </>
        )}
      </div>

      {/* Additional Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Population Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {((data.summary.totalMemberships / data.summary.totalPeople) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Faction Membership Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {((data.summary.peopleWithoutWork / data.summary.totalPeople) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Unemployment Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(data.summary.totalPeople / data.summary.totalLocations).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">People per Building</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemographicsCharts
