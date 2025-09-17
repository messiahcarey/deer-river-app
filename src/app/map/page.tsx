'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import InteractiveMap from "@/components/InteractiveMap"

interface Location {
  id: string
  name: string
  kind: string
  address: string | null
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

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/locations')
      const data = await response.json()
      
      if (data.success) {
        setLocations(data.data)
      } else {
        setError(data.error || 'Failed to fetch locations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
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
Tobren Veylinor's Manor,Residential,"Fortified complex with palisade fence and multiple structures",30,80,15,"Noble estate with dock access"
Corven's Barracks,Military,"Building with brown roof",80,70,12,"Guard barracks and training facility"
Corven's Drill Tents,Military,"Three conical tents in fenced clearing",90,40,8,"Training grounds and temporary quarters"
Ferrin Sisters Gardens,Residential,"Two small conical tents by the river",20,90,4,"Herbalist gardens and living quarters"`

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
        await fetchLocations() // Refresh the locations
        alert(`Successfully imported ${result.importedCount} locations!`)
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
            🗺️ Map of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Explore the geography of Deer River and see where everyone lives and works.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Interactive Map
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={fetchLocations}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  {locations.length === 0 && (
                    <button
                      onClick={handleImportLocations}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      📊 Import Locations
                    </button>
                  )}
                </div>
              </div>

              {loading && (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={fetchLocations}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && locations.length === 0 && (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      No Locations Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Import location data to see the interactive map of Deer River.
                    </p>
                    <button
                      onClick={handleImportLocations}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      📊 Import Locations
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && locations.length > 0 && (
                <div className="h-96">
                  <InteractiveMap
                    locations={locations}
                    onLocationClick={handleLocationClick}
                    selectedLocationId={selectedLocation?.id}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Location Details
              </h2>

              {!selectedLocation ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-gray-600">
                    Click on a location marker to see details
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {selectedLocation.name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {selectedLocation.kind}
                    </p>
                  </div>

                  {selectedLocation.address && (
                    <div>
                      <h4 className="font-medium text-gray-700">Description</h4>
                      <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                    </div>
                  )}

                  {selectedLocation.notes && (
                    <div>
                      <h4 className="font-medium text-gray-700">Notes</h4>
                      <p className="text-sm text-gray-600">{selectedLocation.notes}</p>
                    </div>
                  )}

                  {selectedLocation.residents.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700">Residents ({selectedLocation.residents.length})</h4>
                      <div className="space-y-1">
                        {selectedLocation.residents.map((resident) => (
                          <div key={resident.id} className="text-sm text-gray-600">
                            {resident.name} ({resident.species})
                            {resident.faction && (
                              <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100">
                                {resident.faction.name}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLocation.workers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700">Workers ({selectedLocation.workers.length})</h4>
                      <div className="space-y-1">
                        {selectedLocation.workers.map((worker) => (
                          <div key={worker.id} className="text-sm text-gray-600">
                            {worker.name} ({worker.species})
                            {worker.faction && (
                              <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100">
                                {worker.faction.name}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Close Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}