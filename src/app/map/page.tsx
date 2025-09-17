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
      const response = await fetch('/api/locations')
      const data = await response.json()
      
      if (data.success) {
        setBuildings(data.data)
      } else {
        setError(data.error || 'Failed to fetch buildings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleMapUpload = (file: File) => {
    setMapFile(file)
    console.log('Map uploaded:', file.name)
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
            Manage your town's buildings, residents, and workers. Upload your hand-drawn map for reference.
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
                <button
                  onClick={fetchBuildings}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔄 Refresh
                </button>
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