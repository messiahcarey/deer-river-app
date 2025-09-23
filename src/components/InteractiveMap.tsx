'use client'

import { useState } from 'react'

interface Location {
  id: string
  name: string
  type: string
  description: string | null
  x: number | null
  y: number | null
  notes: string | null
  residents: Array<{
    id: string
    name: string
    species: string
    faction: {
      id: string
      name: string
      color: string | null
    } | null
  }>
  workers: Array<{
    id: string
    name: string
    species: string
    faction: {
      id: string
      name: string
      color: string | null
    } | null
  }>
}

interface InteractiveMapProps {
  locations: Location[]
  onLocationClick?: (location: Location) => void
  selectedLocationId?: string
}

export default function InteractiveMap({ 
  locations, 
  onLocationClick, 
  selectedLocationId 
}: InteractiveMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)

  const getLocationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business':
        return '🏪'
      case 'residential':
        return '🏠'
      case 'military':
        return '🏰'
      case 'dock':
        return '⚓'
      default:
        return '📍'
    }
  }

  const getLocationColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business':
        return 'bg-blue-500'
      case 'residential':
        return 'bg-green-500'
      case 'military':
        return 'bg-red-500'
      case 'dock':
        return 'bg-cyan-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getLocationSize = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business':
        return 'w-8 h-8'
      case 'residential':
        return 'w-6 h-6'
      case 'military':
        return 'w-10 h-10'
      case 'dock':
        return 'w-7 h-7'
      default:
        return 'w-6 h-6'
    }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-4 left-4 w-2 h-2 bg-green-600 rounded-full"></div>
        <div className="absolute top-8 left-12 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-12 left-8 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
        <div className="absolute top-16 left-20 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-20 left-16 w-2 h-2 bg-green-600 rounded-full"></div>
        <div className="absolute top-24 left-24 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-28 left-12 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
        <div className="absolute top-32 left-28 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-36 left-20 w-2 h-2 bg-green-600 rounded-full"></div>
        <div className="absolute top-40 left-32 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-44 left-16 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
        <div className="absolute top-48 left-36 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-52 left-24 w-2 h-2 bg-green-600 rounded-full"></div>
        <div className="absolute top-56 left-40 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-60 left-28 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
        <div className="absolute top-64 left-44 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-68 left-32 w-2 h-2 bg-green-600 rounded-full"></div>
        <div className="absolute top-72 left-48 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-76 left-36 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
        <div className="absolute top-80 left-52 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-84 left-40 w-2 h-2 bg-green-600 rounded-full"></div>
        <div className="absolute top-88 left-56 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-92 left-44 w-1.5 h-1.5 bg-green-600 rounded-full"></div>
        <div className="absolute top-96 left-60 w-1 h-1 bg-green-600 rounded-full"></div>
        <div className="absolute top-100 left-48 w-2 h-2 bg-green-600 rounded-full"></div>
      </div>

      {/* River */}
      <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-b from-blue-300 to-blue-400 opacity-60"></div>
      <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-b from-blue-200 to-blue-300 opacity-40"></div>

      {/* Locations */}
      {locations.map((location) => {
        if (!location.x || !location.y) return null

        const isSelected = selectedLocationId === location.id
        const isHovered = hoveredLocation === location.id

        return (
          <div
            key={location.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
              isSelected ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`,
            }}
            onClick={() => onLocationClick?.(location)}
            onMouseEnter={() => setHoveredLocation(location.id)}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            {/* Location Marker */}
            <div
              className={`${getLocationSize(location.type)} ${getLocationColor(location.type)} rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white ${
                isSelected ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
              } ${isHovered ? 'scale-110' : 'hover:scale-105'}`}
            >
              <span className="text-xs">
                {getLocationIcon(location.type)}
              </span>
            </div>

            {/* Location Label */}
            <div
              className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-white rounded shadow-lg text-xs font-medium whitespace-nowrap ${
                isHovered || isSelected ? 'opacity-100' : 'opacity-0'
              } transition-opacity duration-200`}
            >
              {location.name}
            </div>

            {/* Resident Count */}
            {(location.residents.length > 0 || location.workers.length > 0) && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-gray-800">
                {location.residents.length + location.workers.length}
              </div>
            )}
          </div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Business</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Residential</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Military</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
            <span>Dock</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Map Stats</h3>
        <div className="space-y-1 text-xs">
          <div>Locations: {locations.length}</div>
          <div>Residents: {locations.reduce((sum, loc) => sum + loc.residents.length, 0)}</div>
          <div>Workers: {locations.reduce((sum, loc) => sum + loc.workers.length, 0)}</div>
        </div>
      </div>
    </div>
  )
}
