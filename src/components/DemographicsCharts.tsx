'use client'

import React, { useState, useEffect } from 'react'

interface DemographicsData {
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

// Population Pyramid Component
const PopulationPyramid: React.FC<{
  data: DemographicsData
}> = ({ data }) => {
  // This is a simplified version - in a real app you'd have age/gender data
  const pyramidData = [
    { category: 'Adults', count: Math.floor(data.summary.totalPeople * 0.7) },
    { category: 'Elders', count: Math.floor(data.summary.totalPeople * 0.2) },
    { category: 'Youth', count: Math.floor(data.summary.totalPeople * 0.1) }
  ]

  const maxCount = Math.max(...pyramidData.map(item => item.count))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Population Structure</h3>
      <div className="flex items-end justify-center space-x-4 h-48">
        {pyramidData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg w-16 flex items-center justify-center text-white font-medium text-sm"
              style={{ height: `${(item.count / maxCount) * 150}px` }}
            >
              {item.count}
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              {item.category}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Total Population: {data.summary.totalPeople}
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

  const speciesData = data.distributions.species.map((item, index) => ({
    label: item.species,
    value: item.count,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
  }))

  const occupationData = data.distributions.occupations.map((item, index) => ({
    label: item.occupation,
    value: item.count,
    color: `hsl(${(index * 137.5 + 120) % 360}, 70%, 50%)`
  }))

  const factionData = data.distributions.factions.map((item, index) => ({
    label: item.factionName,
    value: item.count,
    color: item.color
  }))

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
              onClick={() => setActiveTab(tab.id as any)}
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
