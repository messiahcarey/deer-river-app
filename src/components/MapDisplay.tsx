'use client'

import { useState, useRef } from 'react'

interface MapDisplayProps {
  onMapUpload?: (file: File) => void
}

export default function MapDisplay({ onMapUpload }: MapDisplayProps) {
  const [mapImage, setMapImage] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMapImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      onMapUpload?.(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {!mapImage ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="text-6xl">🗺️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Upload Your Deer River Map
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your hand-drawn map here, or click to browse
              </p>
              <button
                onClick={onButtonClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Choose Map Image
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, and other image formats
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Deer River Map
            </h3>
            <div className="flex gap-2">
              <button
                onClick={onButtonClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Replace Map
              </button>
              <button
                onClick={() => setMapImage(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Remove Map
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mapImage}
              alt="Deer River Map"
              className="w-full h-auto max-h-96 object-contain bg-gray-50"
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">Map Features</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Upload and view your hand-drawn map</li>
              <li>• Easy to replace with updated versions</li>
              <li>• Interactive features coming in future updates</li>
              <li>• Perfect for planning and reference</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
