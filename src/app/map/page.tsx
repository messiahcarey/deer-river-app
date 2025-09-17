'use client'

import Link from "next/link"
import { useState } from "react"
import MapDisplay from "@/components/MapDisplay"

export default function MapPage() {
  const [mapFile, setMapFile] = useState<File | null>(null)

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
            🗺️ Map of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Upload and view your hand-drawn map of Deer River. Interactive features coming soon!
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Deer River Map
              </h2>
              <p className="text-gray-600">
                Upload your hand-drawn map to visualize the layout of Deer River. 
                This is perfect for planning and reference while we build out the interactive features.
              </p>
            </div>

            <MapDisplay onMapUpload={handleMapUpload} />

            {mapFile && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Map Uploaded Successfully!</h3>
                <p className="text-sm text-green-700">
                  File: {mapFile.name} ({(mapFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
                <p className="text-sm text-green-600 mt-1">
                  You can now reference this map while managing your town's population and resources.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Future Map Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-medium mb-2">Interactive Elements</h4>
                <ul className="space-y-1">
                  <li>• Clickable location markers</li>
                  <li>• Resident and worker placement</li>
                  <li>• Building details and capacity</li>
                  <li>• Resource tracking by location</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Planning Tools</h4>
                <ul className="space-y-1">
                  <li>• Drag and drop building placement</li>
                  <li>• Population density visualization</li>
                  <li>• Faction territory mapping</li>
                  <li>• Event timeline integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}