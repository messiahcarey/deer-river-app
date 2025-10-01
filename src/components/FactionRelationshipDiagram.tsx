'use client'

import { useState, useEffect, useRef } from 'react'

interface Faction {
  id: string
  name: string
  motto: string | null
  color: string
  members: Array<{
    id: string
    name: string
    isPrimary: boolean
  }>
}

interface FactionRelationshipDiagramProps {
  factions: Faction[]
  onFactionClick: (faction: Faction) => void
  onFactionHover: (faction: Faction | null) => void
  selectedFactionId?: string
}

export default function FactionRelationshipDiagram({
  factions,
  onFactionClick,
  onFactionHover,
  selectedFactionId
}: FactionRelationshipDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredFaction, setHoveredFaction] = useState<Faction | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Calculate positions in a circle
  const getFactionPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total
    const radius = 150
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    }
  }

  const drawDiagram = () => {
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

    const centerX = canvas.width / 4
    const centerY = canvas.height / 4

    // Draw connections between factions (based on shared members)
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])

    factions.forEach((faction1, index1) => {
      const pos1 = getFactionPosition(index1, factions.length)
      const x1 = centerX + pos1.x * zoom + pan.x
      const y1 = centerY + pos1.y * zoom + pan.y

      factions.forEach((faction2, index2) => {
        if (index2 <= index1) return

        const pos2 = getFactionPosition(index2, factions.length)
        const x2 = centerX + pos2.x * zoom + pan.x
        const y2 = centerY + pos2.y * zoom + pan.y

        // Check for shared members
        const sharedMembers = faction1.members.filter(member1 =>
          faction2.members.some(member2 => member1.id === member2.id)
        ).length

        if (sharedMembers > 0) {
          // Draw connection line
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()

          // Draw connection strength indicator
          const midX = (x1 + x2) / 2
          const midY = (y1 + y2) / 2
          ctx.fillStyle = '#6b7280'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(sharedMembers.toString(), midX, midY - 5)
        }
      })
    })

    // Draw factions
    factions.forEach((faction, index) => {
      const pos = getFactionPosition(index, factions.length)
      const x = centerX + pos.x * zoom + pan.x
      const y = centerY + pos.y * zoom + pan.y

      const radius = 30
      const isSelected = selectedFactionId === faction.id
      const isHovered = hoveredFaction?.id === faction.id

      // Draw faction circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      
      if (isSelected) {
        ctx.fillStyle = faction.color
        ctx.strokeStyle = '#1d4ed8'
        ctx.lineWidth = 3
      } else if (isHovered) {
        ctx.fillStyle = faction.color
        ctx.strokeStyle = '#059669'
        ctx.lineWidth = 2
      } else {
        ctx.fillStyle = faction.color
        ctx.strokeStyle = '#374151'
        ctx.lineWidth = 1
      }
      
      ctx.fill()
      ctx.stroke()

      // Draw faction icon
      ctx.fillStyle = 'white'
      ctx.font = '20px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      let icon = '🏛️'
      if (faction.name.toLowerCase().includes('guard')) icon = '🛡️'
      else if (faction.name.toLowerCase().includes('merchant')) icon = '💰'
      else if (faction.name.toLowerCase().includes('guild')) icon = '⚔️'
      else if (faction.name.toLowerCase().includes('temple')) icon = '⛪'
      else if (faction.name.toLowerCase().includes('noble')) icon = '👑'
      else icon = '🏛️'
      
      ctx.fillText(icon, x, y)

      // Draw faction name
      ctx.fillStyle = '#374151'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(faction.name, x, y + radius + 15)

      // Draw member count
      ctx.fillStyle = '#6b7280'
      ctx.font = '10px Arial'
      ctx.fillText(`${faction.members.length} members`, x, y + radius + 30)
    })

    // Draw center title
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Faction Relationships', centerX, centerY - 200)
  }

  useEffect(() => {
    drawDiagram()
  }, [factions, hoveredFaction, selectedFactionId, zoom, pan, drawDiagram])

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      const newPan = {
        x: pan.x + (e.clientX - dragStart.x),
        y: pan.y + (e.clientY - dragStart.y)
      }
      setPan(newPan)
      setDragStart({ x: e.clientX, y: e.clientY })
      return
    }

    const x = e.clientX - e.currentTarget.offsetLeft
    const y = e.clientY - e.currentTarget.offsetTop

    const centerX = e.currentTarget.width / 2
    const centerY = e.currentTarget.height / 2

    // Find faction under mouse
    const faction = factions.find((faction, index) => {
      const pos = getFactionPosition(index, factions.length)
      const fx = centerX + pos.x * zoom + pan.x
      const fy = centerY + pos.y * zoom + pan.y
      const distance = Math.sqrt((x - fx) ** 2 + (y - fy) ** 2)
      return distance <= 30
    })

    if (faction !== hoveredFaction) {
      setHoveredFaction(faction || null)
      onFactionHover(faction || null)
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
        <h3 className="text-lg font-semibold text-gray-900">🔗 Faction Relationships</h3>
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
            setHoveredFaction(null)
            onFactionHover(null)
            setIsDragging(false)
          }}
          onWheel={handleWheel}
        />
        
        {hoveredFaction && (
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
            <h4 className="font-semibold text-gray-900 mb-2">{hoveredFaction.name}</h4>
            {hoveredFaction.motto && (
              <p className="text-sm text-gray-600 mb-2 italic">"{hoveredFaction.motto}"</p>
            )}
            <div className="text-sm text-gray-600 mb-2">
              <p>Members: {hoveredFaction.members.length}</p>
              <p>Primary Members: {hoveredFaction.members.filter(m => m.isPrimary).length}</p>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              <p>Key Members:</p>
              <ul className="list-disc list-inside ml-2">
                {hoveredFaction.members.slice(0, 3).map(member => (
                  <li key={member.id}>{member.name}</li>
                ))}
                {hoveredFaction.members.length > 3 && (
                  <li>...and {hoveredFaction.members.length - 3} more</li>
                )}
              </ul>
            </div>
            <button
              onClick={() => onFactionClick(hoveredFaction)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              View Details
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>• Factions are connected if they share members</p>
        <p>• Numbers on lines show how many shared members</p>
        <p>• Click and drag to pan, mouse wheel to zoom</p>
        <p>• Hover over factions to see details</p>
      </div>
    </div>
  )
}
