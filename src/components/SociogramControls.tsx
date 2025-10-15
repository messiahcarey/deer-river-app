'use client'

// Controls for filtering and searching the network visualization
import { useState, useCallback } from 'react'
import { GraphFilters, GraphData } from '@/types/graph'

interface SociogramControlsProps {
  filters: GraphFilters
  onFiltersChange: (filters: GraphFilters) => void
  loading: boolean
  data: GraphData | null
}

export function SociogramControls({ 
  filters, 
  onFiltersChange, 
  loading, 
  data 
}: SociogramControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleKindToggle = useCallback((kind: string) => {
    const currentKinds = filters.kinds || []
    const newKinds = currentKinds.includes(kind)
      ? currentKinds.filter(k => k !== kind)
      : [...currentKinds, kind]
    
    onFiltersChange({
      ...filters,
      kinds: newKinds
    })
  }, [filters, onFiltersChange])

  const handleInvolvementChange = useCallback((value: number) => {
    onFiltersChange({
      ...filters,
      minInvolvement: value
    })
  }, [filters, onFiltersChange])

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({
      ...filters,
      search: value
    })
  }, [filters, onFiltersChange])

  const handleLimitChange = useCallback((value: number) => {
    onFiltersChange({
      ...filters,
      limit: value
    })
  }, [filters, onFiltersChange])

  const resetFilters = useCallback(() => {
    onFiltersChange({
      kinds: ['person', 'faction', 'household', 'workplace'],
      minInvolvement: 0,
      search: '',
      limit: 100
    })
  }, [onFiltersChange])

  const nodeKindOptions = [
    { key: 'person', label: 'People', color: '#4b7bec' },
    { key: 'faction', label: 'Factions', color: '#e67e22' },
    { key: 'household', label: 'Households', color: '#16a085' },
    { key: 'workplace', label: 'Workplaces', color: '#8e44ad' }
  ]

  const limitOptions = [50, 100, 200, 500]

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-900">Network Controls</span>
          {data && (
            <span className="text-xs text-gray-500">
              ({data.metadata.totalNodes} nodes, {data.metadata.totalEdges} edges)
            </span>
          )}
        </div>
        <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 space-y-4">
          {/* Node Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Node Types
            </label>
            <div className="grid grid-cols-2 gap-2">
              {nodeKindOptions.map(option => (
                <label key={option.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.kinds?.includes(option.key) || false}
                    onChange={() => handleKindToggle(option.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Involvement Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Involvement: {(filters.minInvolvement || 0) * 100}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minInvolvement || 0}
              onChange={(e) => handleInvolvementChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Node Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Nodes
            </label>
            <select
              value={filters.limit || 100}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              {limitOptions.map(limit => (
                <option key={limit} value={limit}>{limit}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2 border-t border-gray-200">
            <button
              onClick={resetFilters}
              className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Reset
            </button>
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
