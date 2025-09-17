'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import MapDisplay from "@/components/MapDisplay"
import BuildingTable from "@/components/BuildingTable"

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

export default function MapPage() {
  const [mapFile, setMapFile] = useState<File | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      console.log('Fetching buildings from /api/locations...')
      const response = await fetch('/api/locations')
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.success) {
        setBuildings(data.data)
        console.log('Buildings loaded:', data.data.length)
      } else {
        setError(data.error || 'Failed to fetch buildings')
        console.error('API error:', data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMapUpload = (file: File) => {
    setMapFile(file)
    console.log('Map uploaded:', file.name)
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

  const handleTestDatabase = async () => {
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      alert(`Database test: ${data.success ? 'SUCCESS' : 'FAILED'}\n${data.message}`)
    } catch (err) {
      alert(`Database test failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
            🏗️ Buildings & Map of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Manage your town&apos;s buildings, residents, and workers. Upload your hand-drawn map for reference.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🗺️ Deer River Map
              </h2>
              <p className="text-gray-600 mb-4">
                Upload your hand-drawn map to visualize the layout of Deer River.
              </p>
              <MapDisplay onMapUpload={handleMapUpload} />
              
              {mapFile && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Map Uploaded Successfully!</h3>
                  <p className="text-sm text-green-700">
                    File: {mapFile.name} ({(mapFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Town Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{buildings.length}</div>
                  <div className="text-sm text-gray-600">Buildings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {buildings.reduce((sum, b) => sum + b.residents.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Residents</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {buildings.reduce((sum, b) => sum + b.workers.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Workers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {new Set(buildings.map(b => b.kind)).size}
                  </div>
                  <div className="text-sm text-gray-600">Building Types</div>
                </div>
              </div>
            </div>
          </div>

          {/* Buildings Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  🏗️ Buildings & Occupants
                </h2>
                <div className="flex gap-2">
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
                  <button
                    onClick={handleTestDatabase}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    🔧 Test Database
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                View all buildings in Deer River and see who lives and works in each one.
              </p>
              
              <BuildingTable 
                buildings={buildings}
                loading={loading}
                error={error}
                onRefresh={fetchBuildings}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}