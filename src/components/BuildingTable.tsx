'use client'

import { useState } from 'react'

interface Person {
  id: string
  name: string
  species: string
  age: number | null
  occupation: string | null
  faction: {
    id: string
    name: string
    color: string | null
  } | null
}

interface Building {
  id: string
  name: string
  kind: string
  address: string | null
  notes: string | null
  residents: Person[]
  workers: Person[]
}

interface BuildingTableProps {
  buildings: Building[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

export default function BuildingTable({ buildings, loading, error, onRefresh }: BuildingTableProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [filterKind, setFilterKind] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBuildings = buildings.filter(building => {
    const matchesKind = filterKind === 'all' || building.kind.toLowerCase() === filterKind.toLowerCase()
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         building.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesKind && matchesSearch
  })

  // Sort buildings: those with residents/workers first, then by name
  const sortedBuildings = filteredBuildings.sort((a, b) => {
    const aHasOccupants = a.residents.length > 0 || a.workers.length > 0
    const bHasOccupants = b.residents.length > 0 || b.workers.length > 0
    
    if (aHasOccupants && !bHasOccupants) return -1
    if (!aHasOccupants && bHasOccupants) return 1
    
    return a.name.localeCompare(b.name)
  })

  const getKindIcon = (kind: string) => {
    switch (kind.toLowerCase()) {
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

  const getKindColor = (kind: string) => {
    switch (kind.toLowerCase()) {
      case 'business':
        return 'bg-blue-100 text-blue-800'
      case 'residential':
        return 'bg-green-100 text-green-800'
      case 'military':
        return 'bg-red-100 text-red-800'
      case 'dock':
        return 'bg-cyan-100 text-cyan-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalResidents = buildings.reduce((sum, building) => sum + building.residents.length, 0)
  const totalWorkers = buildings.reduce((sum, building) => sum + building.workers.length, 0)
  const uniqueBuildings = buildings.length

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading buildings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{uniqueBuildings}</div>
          <div className="text-sm text-blue-700">Buildings</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{totalResidents}</div>
          <div className="text-sm text-green-700">Residents</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{totalWorkers}</div>
          <div className="text-sm text-purple-700">Workers</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search buildings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterKind}
          onChange={(e) => setFilterKind(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="business">Business</option>
          <option value="residential">Residential</option>
          <option value="military">Military</option>
          <option value="dock">Dock</option>
        </select>
        <button
          onClick={onRefresh}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Buildings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Building</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Residents</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Workers</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBuildings.map((building) => (
                <tr key={building.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getKindIcon(building.kind)}</span>
                      <div>
                        <div className="font-medium text-gray-900">{building.name}</div>
                        {building.notes && (
                          <div className="text-xs text-gray-500">{building.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getKindColor(building.kind)}`}>
                      {building.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {building.address || 'No description'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {building.residents.length > 0 ? (
                        building.residents.map((resident) => (
                          <div key={resident.id} className="text-xs">
                            <span className="font-medium">{resident.name}</span>
                            <span className="text-gray-500 ml-1">({resident.species})</span>
                            {resident.faction && (
                              <span className="ml-1 px-1 py-0.5 rounded text-xs bg-gray-100">
                                {resident.faction.name}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {building.workers.length > 0 ? (
                        building.workers.map((worker) => (
                          <div key={worker.id} className="text-xs">
                            <span className="font-medium">{worker.name}</span>
                            <span className="text-gray-500 ml-1">({worker.species})</span>
                            {worker.faction && (
                              <span className="ml-1 px-1 py-0.5 rounded text-xs bg-gray-100">
                                {worker.faction.name}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedBuilding(building)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedBuildings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Buildings Found
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterKind !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Import some building data to get started.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Unassigned Residents Section */}
      {sortedBuildings.length > 0 && (
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            👥 Unassigned Residents
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            These residents don&apos;t have assigned living or working locations yet.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedBuildings
              .filter(building => building.residents.length === 0 && building.workers.length === 0)
              .map((building) => (
                <div key={building.id} className="bg-white p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getKindIcon(building.kind)}</span>
                    <h4 className="font-medium text-gray-800">{building.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{building.address || 'No description'}</p>
                  <div className="text-xs text-yellow-600">
                    No residents or workers assigned
                  </div>
                </div>
              ))}
          </div>
          
          {sortedBuildings.filter(building => building.residents.length === 0 && building.workers.length === 0).length === 0 && (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">✅</div>
              <p className="text-sm text-yellow-700">
                All buildings have residents or workers assigned!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Building Details Modal */}
      {selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
                    <span className="text-2xl">{getKindIcon(selectedBuilding.kind)}</span>
                    <span>{selectedBuilding.name}</span>
                  </h3>
                  <p className="text-gray-600 capitalize">{selectedBuilding.kind}</p>
                </div>
                <button
                  onClick={() => setSelectedBuilding(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedBuilding.address && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                  <p className="text-gray-600">{selectedBuilding.address}</p>
                </div>
              )}

              {selectedBuilding.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-gray-600">{selectedBuilding.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Residents ({selectedBuilding.residents.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedBuilding.residents.length > 0 ? (
                      selectedBuilding.residents.map((resident) => (
                        <div key={resident.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-800">{resident.name}</div>
                          <div className="text-sm text-gray-600">
                            {resident.species} • Age: {resident.age || 'Unknown'}
                          </div>
                          {resident.occupation && (
                            <div className="text-sm text-gray-600">
                              Occupation: {resident.occupation}
                            </div>
                          )}
                          {resident.faction && (
                            <div className="mt-1">
                              <span className="px-2 py-1 rounded text-xs bg-gray-200">
                                {resident.faction.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No residents</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Workers ({selectedBuilding.workers.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedBuilding.workers.length > 0 ? (
                      selectedBuilding.workers.map((worker) => (
                        <div key={worker.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium text-gray-800">{worker.name}</div>
                          <div className="text-sm text-gray-600">
                            {worker.species} • Age: {worker.age || 'Unknown'}
                          </div>
                          {worker.occupation && (
                            <div className="text-sm text-gray-600">
                              Occupation: {worker.occupation}
                            </div>
                          )}
                          {worker.faction && (
                            <div className="mt-1">
                              <span className="px-2 py-1 rounded text-xs bg-gray-200">
                                {worker.faction.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No workers</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
