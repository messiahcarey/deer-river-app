'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Person {
  id: string
  name: string
  species: string
  cohorts: Array<{
    cohort: {
      id: string
      name: string
      color: string | null
    }
  }>
}

interface Relationship {
  id: string
  fromPersonId: string
  toPersonId: string
  domain: string
  involvement: string
  score: number
  provenance: string
  fromPerson: {
    id: string
    name: string
    species: string
  }
  toPerson: {
    id: string
    name: string
    species: string
  }
}

export default function RelationshipNetwork() {
  const [people, setPeople] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL')
  const [selectedCohort, setSelectedCohort] = useState<string>('ALL')
  const [minScore, setMinScore] = useState<number>(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch people with cohorts
      const peopleResponse = await fetch('/api/people')
      if (!peopleResponse.ok) throw new Error('Failed to fetch people')
      const peopleData = await peopleResponse.json()
      setPeople(peopleData)

      // Fetch relationships
      const relationshipsResponse = await fetch('/api/relationships')
      if (!relationshipsResponse.ok) throw new Error('Failed to fetch relationships')
      const relationshipsData = await relationshipsResponse.json()
      setRelationships(relationshipsData)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredRelationships = relationships.filter(rel => {
    if (selectedDomain !== 'ALL' && rel.domain !== selectedDomain) return false
    if (selectedCohort !== 'ALL') {
      const fromPerson = people.find(p => p.id === rel.fromPersonId)
      const toPerson = people.find(p => p.id === rel.toPersonId)
      if (!fromPerson || !toPerson) return false
      
      const fromInCohort = fromPerson.cohorts.some(c => c.cohort.id === selectedCohort)
      const toInCohort = toPerson.cohorts.some(c => c.cohort.id === selectedCohort)
      if (!fromInCohort && !toInCohort) return false
    }
    if (rel.score < minScore) return false
    return true
  })

  const drawNetwork = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set up canvas
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // Get unique people from filtered relationships
    const uniquePeople = new Set<string>()
    filteredRelationships.forEach(rel => {
      uniquePeople.add(rel.fromPersonId)
      uniquePeople.add(rel.toPersonId)
    })

    const peopleList = Array.from(uniquePeople).map(id => 
      people.find(p => p.id === id)
    ).filter(Boolean) as Person[]

    if (peopleList.length === 0) {
      ctx.fillStyle = '#666'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('No relationships to display', centerX, centerY)
      return
    }

    // Calculate positions in a circle
    const radius = Math.min(width, height) * 0.3
    const positions = new Map<string, { x: number; y: number }>()

    peopleList.forEach((person, index) => {
      const angle = (2 * Math.PI * index) / peopleList.length
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      positions.set(person.id, { x, y })
    })

    // Draw relationships
    filteredRelationships.forEach(rel => {
      const fromPos = positions.get(rel.fromPersonId)
      const toPos = positions.get(rel.toPersonId)
      
      if (!fromPos || !toPos) return

      // Color based on domain
      let color = '#999'
      if (rel.domain === 'KINSHIP') color = '#e74c3c'
      else if (rel.domain === 'FACTION') color = '#3498db'
      else if (rel.domain === 'WORK') color = '#f39c12'

      // Opacity based on score
      const opacity = Math.max(0.2, rel.score / 100)
      
      ctx.strokeStyle = color + Math.floor(opacity * 255).toString(16).padStart(2, '0')
      ctx.lineWidth = Math.max(1, rel.score / 20)
      
      ctx.beginPath()
      ctx.moveTo(fromPos.x, fromPos.y)
      ctx.lineTo(toPos.x, toPos.y)
      ctx.stroke()

      // Draw score label
      const midX = (fromPos.x + toPos.x) / 2
      const midY = (fromPos.y + toPos.y) / 2
      
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(rel.score.toString(), midX, midY)
    })

    // Draw people nodes
    peopleList.forEach(person => {
      const pos = positions.get(person.id)
      if (!pos) return

      // Color based on primary cohort
      const primaryCohort = person.cohorts[0]?.cohort
      const color = primaryCohort?.color || '#95a5a6'

      // Draw node
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI)
      ctx.fill()

      // Draw border
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw name
      ctx.fillStyle = '#333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(person.name.split(' ')[0], pos.x, pos.y + 5)
    })
  }

  useEffect(() => {
    drawNetwork()
  }, [filteredRelationships, people])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🕸️ Relationship Network
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl">
            Visualize the social connections and relationships between people in Deer River.
          </p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Network Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Domains</option>
                <option value="KINSHIP">Kinship</option>
                <option value="FACTION">Faction</option>
                <option value="WORK">Work</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cohort
              </label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Cohorts</option>
                {Array.from(new Set(people.flatMap(p => p.cohorts.map(c => c.cohort.id)))).map(cohortId => {
                  const cohort = people.flatMap(p => p.cohorts).find(c => c.cohort.id === cohortId)?.cohort
                  return (
                    <option key={cohortId} value={cohortId}>
                      {cohort?.name || 'Unknown'}
                    </option>
                  )
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Score
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{minScore}</div>
            </div>
            <div className="flex items-end">
              <button
                onClick={drawNetwork}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Refresh Network
              </button>
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Network Visualization</h2>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-gray-300 rounded-lg w-full"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Kinship</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Faction</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              <span className="text-sm">Work</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Network Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-600">Total People</p>
              <p className="text-3xl font-bold text-blue-900">{people.length}</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <p className="text-sm font-medium text-green-600">Relationships</p>
              <p className="text-3xl font-bold text-green-900">{relationships.length}</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
              <p className="text-sm font-medium text-purple-600">Filtered</p>
              <p className="text-3xl font-bold text-purple-900">{filteredRelationships.length}</p>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-600">Avg Score</p>
              <p className="text-3xl font-bold text-orange-900">
                {filteredRelationships.length > 0 
                  ? Math.round(filteredRelationships.reduce((sum, rel) => sum + rel.score, 0) / filteredRelationships.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        {/* Back to Involvement */}
        <div className="mt-8 text-center">
          <a
            href="/involvement"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            ← Back to Involvement System
          </a>
        </div>
      </div>
    </div>
  )
}
