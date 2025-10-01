'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Person {
  id: string
  name: string
  species: string
  age: number | null
  occupation: string | null
}

interface Building {
  id: string
  name: string
  kind: string
  address: string | null
  notes: string | null
  x: number | null
  y: number | null
  residents: Person[]
  workers: Person[]
}

interface InteractiveMapVisualizationProps {
  buildings: Building[]
  onBuildingClick: (building: Building) => void
  onBuildingHover: (building: Building | null) => void
  selectedBuildingId?: string
}

export default function InteractiveMapVisualization({
  buildings,
  onBuildingClick,
  onBuildingHover,
  selectedBuildingId
}: InteractiveMapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Calculate bounds for all buildings
  const bounds = buildings.reduce((acc, building) => {
    if (building.x !== null && building.y !== null) {
      acc.minX = Math.min(acc.minX, building.x)
      acc.maxX = Math.max(acc.maxX, building.x)
      acc.minY = Math.min(acc.minY, building.y)
      acc.maxY = Math.max(acc.maxY, building.y)
    }
    return acc
  }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity })

  // If no coordinates, create a grid layout
  const hasCoordinates = buildings.some(b => b.x !== null && b.y !== null)
  
  if (!hasCoordinates) {
    // Create a grid layout for buildings without coordinates
    buildings.forEach((building, index) => {
      const cols = Math.ceil(Math.sqrt(buildings.length))
      const row = Math.floor(index / cols)
      const col = index % cols
      building.x = col * 200 + 100
      building.y = row * 150 + 100
    })
  }

  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const width = Math.max(bounds.maxX - bounds.minX, 400)
  const height = Math.max(bounds.maxY - bounds.minY, 300)

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set background
    ctx.fillStyle = '#fef3c7'
    ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2)

    // Draw grid
    ctx.strokeStyle = '#d97706'
    ctx.lineWidth = 0.5
    const gridSize = 50
    for (let x = 0; x < canvas.width / 2; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height / 2)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height / 2; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width / 2, y)
      ctx.stroke()
    }

    // Draw buildings
    buildings.forEach((building) => {
      if (building.x === null || building.y === null) return

      const x = (building.x - centerX + width / 2) * zoom + pan.x + canvas.width / 4
      const y = (building.y - centerY + height / 2) * zoom + pan.y + canvas.height / 4

      // Building circle
      const radius = 20
      const isSelected = selectedBuildingId === building.id
      const isHovered = hoveredBuilding?.id === building.id

      // Draw building
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      
      if (isSelected) {
        ctx.fillStyle = '#3b82f6'
        ctx.strokeStyle = '#1d4ed8'
        ctx.lineWidth = 3
      } else if (isHovered) {
        ctx.fillStyle = '#10b981'
        ctx.strokeStyle = '#059669'
        ctx.lineWidth = 2
      } else {
        ctx.fillStyle = '#f59e0b'
        ctx.strokeStyle = '#d97706'
        ctx.lineWidth = 1
      }
      
      ctx.fill()
      ctx.stroke()

      // Draw building icon
      ctx.fillStyle = 'white'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      let icon = '🏠'
      if (building.kind === 'building') {
        if (building.name.toLowerCase().includes('tavern')) icon = '🍺'
        else if (building.name.toLowerCase().includes('shop')) icon = '🏪'
        else if (building.name.toLowerCase().includes('temple')) icon = '⛪'
        else if (building.name.toLowerCase().includes('guild')) icon = '🏛️'
        else if (building.name.toLowerCase().includes('residence')) icon = '🏘️'
        else icon = '🏠'
      }
      
      ctx.fillText(icon, x, y)

      // Draw building name
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(building.name, x, y + radius + 15)

      // Draw resident/worker count
      const totalPeople = building.residents.length + building.workers.length
      if (totalPeople > 0) {
        ctx.fillStyle = '#6b7280'
        ctx.font = '10px Arial'
        ctx.fillText(`${totalPeople} people`, x, y + radius + 30)
      }
    })

    // Draw connections between buildings (if they have residents/workers in common)
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    
    buildings.forEach((building1) => {
      if (building1.x === null || building1.y === null) return
      
      buildings.forEach((building2) => {
        if (building2.id <= building1.id || building2.x === null || building2.y === null) return
        
        // Check if buildings share residents or workers
        const sharedPeople = building1.residents.filter(person => 
          building2.residents.some(p => p.id === person.id) ||
          building2.workers.some(p => p.id === person.id)
        ).length + building1.workers.filter(person => 
          building2.residents.some(p => p.id === person.id) ||
          building2.workers.some(p => p.id === person.id)
        ).length

        if (sharedPeople > 0 && building1.x !== null && building1.y !== null && building2.x !== null && building2.y !== null) {
          const x1 = (building1.x - centerX + width / 2) * zoom + pan.x + canvas.width / 4
          const y1 = (building1.y - centerY + height / 2) * zoom + pan.y + canvas.height / 4
          const x2 = (building2.x - centerX + width / 2) * zoom + pan.x + canvas.width / 4
          const y2 = (building2.y - centerY + height / 2) * zoom + pan.y + canvas.height / 4

          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
      })
    })
  }, [buildings, hoveredBuilding, selectedBuildingId, zoom, pan, centerX, centerY, width, height])

  useEffect(() => {
    drawMap()
  }, [drawMap])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
    const newPan = {
      x: pan.x + (e.clientX - dragStart.x),
      y: pan.y + (e.clientY - dragStart.y)
    }
      setPan(newPan)
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }

    const canvas = e.currentTarget as HTMLCanvasElement
    const x = e.clientX - canvas.offsetLeft
    const y = e.clientY - canvas.offsetTop

    // Find building under mouse
    const building = buildings.find((b) => {
      if (b.x === null || b.y === null) return false
      const bx = (b.x - centerX + width / 2) * zoom + pan.x + canvas.width / 2
      const by = (b.y - centerY + height / 2) * zoom + pan.y + canvas.height / 2
      const distance = Math.sqrt((x - bx) ** 2 + (y - by) ** 2)
      return distance <= 20
    })

    if (building !== hoveredBuilding) {
      setHoveredBuilding(building || null)
      onBuildingHover(building || null)
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }

  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🗺️ Interactive Map</h3>
        <div className="flex gap-2">
          <button
            onClick={resetView}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Reset View
          </button>
          <div className="text-sm text-gray-600">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-96 border border-gray-200 rounded cursor-move"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setHoveredBuilding(null)
            onBuildingHover(null)
            setIsDragging(false)
          }}
          onWheel={handleWheel}
        />
        
        {hoveredBuilding && (
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
            <h4 className="font-semibold text-gray-900 mb-2">{hoveredBuilding.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{hoveredBuilding.kind}</p>
            {hoveredBuilding.address && (
              <p className="text-sm text-gray-600 mb-2">{hoveredBuilding.address}</p>
            )}
            <div className="text-sm text-gray-600">
              <p>Residents: {hoveredBuilding.residents.length}</p>
              <p>Workers: {hoveredBuilding.workers.length}</p>
            </div>
            <button
              onClick={() => onBuildingClick(hoveredBuilding)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Click and drag to pan around the map</p>
        <p>• Use mouse wheel to zoom in/out</p>
        <p>• Hover over buildings to see details</p>
        <p>• Buildings are connected if they share residents or workers</p>
      </div>
    </div>
  )
}
