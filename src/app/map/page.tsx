'use client'

import Link from "next/link"
import { useState, useEffect } from "react"

import BuildingEditModal from "@/components/BuildingEditModal"

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
  x: number | null
  y: number | null
  capacity: number | null
  residents: Person[]
  workers: Person[]
}

export default function MapPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      // Use mock data instead of API call
      const mockBuildings = [
        {
          id: '1',
          name: 'Town Hall',
          kind: 'government',
          address: '1 Main Street',
          notes: 'The center of government',
          x: 100,
          y: 100,
          capacity: 50,
          residents: [],
          workers: [
            { id: '1', name: 'John Doe', species: 'Human', age: 35, occupation: 'Mayor', faction: { id: '1', name: 'Town Council', color: '#3B82F6' } }
          ]
        },
        {
          id: '2',
          name: 'Blacksmith Shop',
          kind: 'business',
          address: '5 Forge Lane',
          notes: 'Master craftsman workshop',
          x: 200,
          y: 150,
          capacity: 10,
          residents: [],
          workers: [
            { id: '2', name: 'Jane Smith', species: 'Elf', age: 120, occupation: 'Blacksmith', faction: { id: '3', name: 'Artisans Union', color: '#F59E0B' } }
          ]
        },
        {
          id: '3',
          name: 'Healing House',
          kind: 'business',
          address: '3 Garden Street',
          notes: 'Medical care and healing',
          x: 150,
          y: 200,
          capacity: 20,
          residents: [],
          workers: []
        }
      ]
      setBuildings(mockBuildings)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building)
  }

  const handleSaveBuilding = async (updatedBuilding: Partial<Building>) => {
    try {
      // Update local state instead of making API call
      setBuildings(prev => prev.map(b => 
        b.id === updatedBuilding.id ? { ...b, ...updatedBuilding } : b
      ))
      setEditingBuilding(null)
    } catch (err) {
      throw err
    }
  }

  const handleImportLocations = async () => {
    try {
      // Create a CSV file with the location data
      const csvData = `Name,Type,Description,X,Y,Capacity,Notes
Rusty Pike Inn,Business,"Two-story inn with brown shingled roof and chimney",45,60,20,"Tavern and inn run by Rurik Copperpot"
Forge of Fortune,Business,"Single-story blacksmith with brown roof",55,60,5,"Blacksmith shop run by Oswin Finch"
Ironclad Armory,Business,"Small single-story building with brown roof",50,70,3,"Armor shop run by Eamon Hargrove"
Brigid's Curiosities,Business,"Larger building with bright blue roof and white cross",65,55,8,"Curiosities shop run by Brigid Stormaxe"
River's Edge Goods,Business,"Building with reddish-brown shingled roof",75,55,6,"General goods shop run by Torrin"
Moondancer's Marina,Business,"Single-story building with brown roof and wooden dock",25,25,4,"Ferry dock managed by Valenna Moondancer"
Tobren Veylinor's Manor,Residential,"A single house previously in disrepair but now being repaired",30,80,15,"Noble estate with dock access"
Corven's Barracks,Military,"Building with brown roof",80,70,12,"Guard barracks and training facility"
Corven's Drill Tents,Military,"Three conical tents in fenced clearing",90,40,8,"Training grounds and temporary quarters"
Ferrin Sisters Gardens,Residential,"Two small conical tents by the river, one of which is a greenhouse",20,90,4,"Herbalist gardens and living quarters"
Central Well,Infrastructure,"Small circular well or fountain in central clearing",60,65,1,"Community water source"
Forest Cabin 1,Residential,"Small rustic house with brown roof in forest clearing",85,75,3,"Isolated forest dwelling"
Forest Cabin 2,Residential,"Small rustic house with thatched roof in forest clearing",70,85,3,"Isolated forest dwelling"
Forest Cabin 3,Residential,"Small rustic house with brown roof in forest clearing",40,45,3,"Isolated forest dwelling"
Refugee Tents 1,Residential,"Three conical tents in forest clearing",75,80,6,"Temporary refugee housing"
Refugee Tents 2,Residential,"Single tent in forest clearing",35,70,2,"Temporary refugee housing"
Refugee Tents 3,Residential,"Two tents in forest clearing",60,40,4,"Temporary refugee housing"
Guard Post,Military,"Small watchtower or guard station",45,50,2,"Security checkpoint"
Storage Shed,Infrastructure,"Small storage building with brown roof",55,75,1,"Community storage"
Market Stall,Business,"Temporary market stall or trading post",70,60,2,"Open-air trading area"`

      const blob = new Blob([csvData], { type: 'text/csv' })
      const file = new File([blob], 'deer-river-locations.csv', { type: 'text/csv' })

      const formData = new FormData()
      formData.append('csvFile', file)

      const response = await fetch('/api/import-locations', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (result.success) {
        await fetchBuildings() // Refresh the buildings
        alert(`Successfully imported ${result.importedCount} locations!`)
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

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
      case 'infrastructure':
        return '🏗️'
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
      case 'infrastructure':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🏗️ Buildings of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Manage the buildings and locations of Deer River. View their details, residents, and workers.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Buildings ({buildings.length})
            </h2>
            <div className="flex gap-4">
              <button
                onClick={fetchBuildings}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <button
                onClick={handleImportLocations}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📊 Import All Locations
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading buildings...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {!loading && !error && buildings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                No Buildings Found
              </h3>
              <p className="text-gray-600 mb-6">
                Import some building data using the CSV import feature to get started.
              </p>
              <button
                onClick={handleImportLocations}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                📊 Import Building Data
              </button>
            </div>
          )}

          {!loading && !error && buildings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Building</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Address</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Capacity</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Residents</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Workers</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Coordinates</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {buildings.map((building) => (
                    <tr key={building.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getKindIcon(building.kind)}</span>
                          <div>
                            <div className="font-medium text-gray-900">{building.name}</div>
                            {building.notes && (
                              <div className="text-xs text-gray-500 truncate w-48">{building.notes}</div>
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
                        {building.address || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {building.capacity || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {building.residents.length > 0 ? (
                          <ul className="list-disc list-inside text-xs">
                            {building.residents.map(p => <li key={p.id}>{p.name}</li>)}
                          </ul>
                        ) : 'None'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {building.workers.length > 0 ? (
                          <ul className="list-disc list-inside text-xs">
                            {building.workers.map(p => <li key={p.id}>{p.name}</li>)}
                          </ul>
                        ) : 'None'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 text-xs">
                        {building.x !== null && building.y !== null ? `${building.x}, ${building.y}` : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEditBuilding(building)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-2 py-1 rounded"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !error && buildings.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{buildings.length}</div>
                <div className="text-sm text-blue-700">Total Buildings</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {buildings.reduce((sum, b) => sum + b.residents.length, 0)}
                </div>
                <div className="text-sm text-green-700">Residents</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {buildings.reduce((sum, b) => sum + b.workers.length, 0)}
                </div>
                <div className="text-sm text-purple-700">Workers</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(buildings.map(b => b.kind)).size}
                </div>
                <div className="text-sm text-orange-700">Building Types</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Building Modal */}
        {editingBuilding && (
          <BuildingEditModal
            building={editingBuilding}
            onClose={() => setEditingBuilding(null)}
            onSave={handleSaveBuilding}
          />
        )}
      </div>
    </div>
  )
}