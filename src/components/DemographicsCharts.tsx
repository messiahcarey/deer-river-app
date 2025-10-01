'use client'

import React, { useState } from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'

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

// Pie Chart Component with Recharts
const PieChart: React.FC<{
  data: Array<{ label: string; value: number; color: string }>
  title: string
  size?: number
}> = ({ data, title, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // Convert data to Recharts format
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    fill: item.color
  }))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div style={{ width: size, height: size }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={size * 0.2}
                outerRadius={size * 0.4}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `${label}: ${((data.find(d => d.label === label)?.value || 0) / total * 100).toFixed(1)}%`}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
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

// Bar Chart Component with Recharts
const BarChart: React.FC<{
  data: Array<{ label: string; value: number; color?: string }>
  title: string
  maxBars?: number
}> = ({ data, title, maxBars = 10 }) => {
  const displayData = data.slice(0, maxBars)
  
  // Convert data to Recharts format
  const chartData = displayData.map(item => ({
    name: item.label,
    value: item.value,
    fill: item.color || '#3B82F6'
  }))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar dataKey="value" fill="#3B82F6" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
      {data.length > maxBars && (
        <div className="mt-3 text-sm text-gray-500 text-center">
          +{data.length - maxBars} more
        </div>
      )}
    </div>
  )
}

// Enhanced Population Pyramid Component with Recharts and Chart Switcher
const PopulationPyramid: React.FC<{
  data: DemographicsData
}> = ({ data }) => {
  const [chartType, setChartType] = useState<'pyramid' | 'heatmap'>('pyramid')
  // Get age category data with species breakdown
  const getChartData = () => {
    if (!data.speciesDemographics) {
      // Fallback to simplified data if no species demographics available
      return [
        { ageCategory: 'Young Adult', total: Math.floor(data.summary.totalPeople * 0.3), 'All Species': Math.floor(data.summary.totalPeople * 0.3) },
        { ageCategory: 'Mature', total: Math.floor(data.summary.totalPeople * 0.4), 'All Species': Math.floor(data.summary.totalPeople * 0.4) },
        { ageCategory: 'Middle Aged', total: Math.floor(data.summary.totalPeople * 0.2), 'All Species': Math.floor(data.summary.totalPeople * 0.2) },
        { ageCategory: 'Old', total: Math.floor(data.summary.totalPeople * 0.08), 'All Species': Math.floor(data.summary.totalPeople * 0.08) },
        { ageCategory: 'Venerable', total: Math.floor(data.summary.totalPeople * 0.02), 'All Species': Math.floor(data.summary.totalPeople * 0.02) }
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

    return ageCategories.map(ageCategory => {
      const chartData: Record<string, string | number> = { ageCategory, total: 0 }
      
      speciesList.forEach(species => {
        // Try both lowercase and original case for species lookup
        const speciesKey = species.name.toLowerCase()
        const count = data.speciesDemographics![speciesKey]?.ageCategories[ageCategory] || 0
        chartData[species.name] = count
        chartData.total = (chartData.total as number) + count
      })

      return chartData
    })
  }

  const chartData = getChartData()
  const speciesList = Object.entries(data.speciesDemographics || {})
    .filter(([, stats]) => stats.total > 0)
    .map(([species, stats]) => ({
      name: species.charAt(0).toUpperCase() + species.slice(1),
      total: stats.total
    }))
    .sort((a, b) => b.total - a.total)

  // Debug: Log the data structure
  console.log('Species Demographics Data:', data.speciesDemographics)
  console.log('Species List:', speciesList)
  console.log('Chart Data:', chartData)

  // Generate colors for species
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#6366F1', '#EF4444', '#F97316'
  ]

  // Heatmap data preparation
  const getHeatmapData = () => {
    if (!data.speciesDemographics) return []
    
    const ageCategories = ['Young Adult', 'Mature', 'Middle Aged', 'Old', 'Venerable']
    const heatmapData: Array<Record<string, string | number>> = []
    
    ageCategories.forEach(ageCategory => {
      const row: Record<string, string | number> = { ageCategory }
      let maxCount = 0
      
      speciesList.forEach(species => {
        const speciesKey = species.name.toLowerCase()
        const count = data.speciesDemographics![speciesKey]?.ageCategories[ageCategory] || 0
        row[species.name] = count
        maxCount = Math.max(maxCount, count)
      })
      
      row.maxCount = maxCount
      heatmapData.push(row)
    })
    
    return heatmapData
  }

  const heatmapData = getHeatmapData()
  const maxValue = Math.max(...heatmapData.map(row => row.maxCount as number))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Population Analysis by Age Category & Species
        </h3>
        
        {/* Chart Type Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setChartType('pyramid')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              chartType === 'pyramid'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Pyramid
          </button>
          <button
            onClick={() => setChartType('heatmap')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              chartType === 'heatmap'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔥 Heatmap
          </button>
        </div>
      </div>
      
      <div className="h-96">
        {chartType === 'pyramid' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="horizontal"
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="ageCategory" 
                type="category" 
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Age Category: ${label}`}
              />
              <Legend />
              {speciesList.map((species, index) => (
                <Bar
                  key={species.name}
                  dataKey={species.name}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                  name={species.name}
                  radius={[0, 0, 0, 0]}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full">
            {/* Heatmap Visualization */}
            <div className="grid grid-cols-1 gap-2 h-full">
              {/* Header with species names */}
              <div className="flex items-center">
                <div className="w-24 text-xs font-medium text-gray-600">Age Category</div>
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${speciesList.length}, 1fr)` }}>
                  {speciesList.map((species) => (
                    <div key={species.name} className="text-xs font-medium text-center text-gray-700">
                      {species.name}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Heatmap rows */}
              {heatmapData.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center">
                  <div className="w-24 text-xs text-gray-600 font-medium">
                    {row.ageCategory}
                  </div>
                  <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${speciesList.length}, 1fr)` }}>
                    {speciesList.map((species, speciesIndex) => {
                      const count = row[species.name] as number
                      const intensity = maxValue > 0 ? count / maxValue : 0
                      const bgColor = `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`
                      
                      return (
                        <div
                          key={speciesIndex}
                          className="h-8 flex items-center justify-center text-xs font-medium rounded"
                          style={{ backgroundColor: bgColor }}
                          title={`${species.name}: ${count}`}
                        >
                          {count > 0 && count}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Heatmap Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <span className="text-xs text-gray-600">Intensity:</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}></div>
                <span className="text-xs text-gray-600">Low</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}></div>
                <span className="text-xs text-gray-600">Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
                <span className="text-xs text-gray-600">High</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Total Population: {data.summary.totalPeople} | 
        Age Categories: 5 | 
        Species: {speciesList.length} represented |
        View: {chartType === 'pyramid' ? 'Population Pyramid' : 'Heatmap Matrix'}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'overview' && (
          <>
            <div className="lg:col-span-2">
              <PopulationPyramid data={data} />
            </div>
            <div className="lg:col-span-1">
              <PieChart
                data={speciesData.slice(0, 6)}
                title="Species Distribution"
                size={120}
              />
            </div>
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
