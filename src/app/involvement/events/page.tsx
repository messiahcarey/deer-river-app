'use client'

import React, { useState, useEffect } from 'react'

interface Event {
  id: string
  name: string
  description: string | null
  eventType: string
  startDate: Date
  endDate: Date | null
  isActive: boolean
  worldSeed: string | null
  createdAt: Date
  updatedAt: Date
  effects: EventEffect[]
}

interface EventEffect {
  id: string
  domain: string | null
  effectType: string
  value: number
  scope: string
  sourceCohort: {
    id: string
    name: string
    color: string | null
  } | null
  targetCohort: {
    id: string
    name: string
    color: string | null
  } | null
  fromPerson: {
    id: string
    name: string
  } | null
  toPerson: {
    id: string
    name: string
  } | null
  decayPerDay: number | null
  isActive: boolean
}

export default function EventsPanel() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEffectModal, setShowEffectModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Form states
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    eventType: 'CELEBRATION',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    worldSeed: ''
  })

  const [newEffect, setNewEffect] = useState({
    effectType: 'ADD',
    value: 5,
    scope: 'GLOBAL',
    domain: 'KINSHIP',
    sourceCohortId: '',
    targetCohortId: '',
    fromPersonId: '',
    toPersonId: '',
    decayPerDay: 0
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          endDate: newEvent.endDate || null,
          worldSeed: newEvent.worldSeed || null
        })
      })

      if (!response.ok) throw new Error('Failed to create event')
      
      await fetchEvents()
      setShowCreateModal(false)
      setNewEvent({
        name: '',
        description: '',
        eventType: 'CELEBRATION',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        worldSeed: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
    }
  }

  const handleAddEffect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    try {
      const response = await fetch(`/api/events/${selectedEvent.id}/effects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEffect,
          sourceCohortId: newEffect.sourceCohortId || null,
          targetCohortId: newEffect.targetCohortId || null,
          fromPersonId: newEffect.fromPersonId || null,
          toPersonId: newEffect.toPersonId || null,
          decayPerDay: newEffect.decayPerDay || null
        })
      })

      if (!response.ok) throw new Error('Failed to add effect')
      
      await fetchEvents()
      setShowEffectModal(false)
      setNewEffect({
        effectType: 'ADD',
        value: 5,
        scope: 'GLOBAL',
        domain: 'KINSHIP',
        sourceCohortId: '',
        targetCohortId: '',
        fromPersonId: '',
        toPersonId: '',
        decayPerDay: 0
      })
      setSelectedEvent(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add effect')
    }
  }

  const toggleEventStatus = async (eventId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) throw new Error('Failed to update event')
      
      await fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
    }
  }

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
            🎭 Events Panel
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl">
            Create and manage events that affect relationships between people.
          </p>
        </header>

        {/* Create Event Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            + Create New Event
          </button>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                event.isActive ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{event.name}</h3>
                  <p className="text-sm text-gray-500">
                    {event.eventType} • {new Date(event.startDate).toLocaleDateString()}
                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEffectModal(true)
                    }}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    + Add Effect
                  </button>
                  <button
                    onClick={() => toggleEventStatus(event.id, event.isActive)}
                    className={`px-3 py-1 rounded text-sm ${
                      event.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {event.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              
              {event.description && (
                <p className="text-gray-600 mb-4">{event.description}</p>
              )}

              {event.worldSeed && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">World Seed</p>
                  <p className="text-xs bg-gray-100 p-2 rounded">{event.worldSeed}</p>
                </div>
              )}

              {/* Event Effects */}
              {event.effects.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Effects ({event.effects.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {event.effects.map((effect) => (
                      <div
                        key={effect.id}
                        className={`bg-gray-50 rounded p-4 border-l-4 ${
                          effect.isActive ? 'border-green-500' : 'border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{effect.effectType}</span>
                          <span className="text-sm text-gray-500">{effect.scope}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Value: {effect.value}
                          {effect.effectType === 'DECAY' && effect.decayPerDay && (
                            <span> (decay: {effect.decayPerDay}/day)</span>
                          )}
                        </p>
                        {effect.domain && (
                          <p className="text-xs text-gray-500">Domain: {effect.domain}</p>
                        )}
                        {effect.sourceCohort && (
                          <p className="text-xs text-gray-500">
                            {effect.sourceCohort.name} → {effect.targetCohort?.name || 'All'}
                          </p>
                        )}
                        {effect.fromPerson && (
                          <p className="text-xs text-gray-500">
                            {effect.fromPerson.name} → {effect.toPerson?.name || 'All'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
              <form onSubmit={handleCreateEvent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="CELEBRATION">Celebration</option>
                      <option value="CONFLICT">Conflict</option>
                      <option value="TRAGEDY">Tragedy</option>
                      <option value="TRADE">Trade</option>
                      <option value="FESTIVAL">Festival</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    World Seed (optional)
                  </label>
                  <input
                    type="text"
                    value={newEvent.worldSeed}
                    onChange={(e) => setNewEvent({ ...newEvent, worldSeed: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter world seed for deterministic effects"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Create Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Effect Modal */}
        {showEffectModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                Add Effect to {selectedEvent.name}
              </h2>
              <form onSubmit={handleAddEffect}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effect Type
                    </label>
                    <select
                      value={newEffect.effectType}
                      onChange={(e) => setNewEffect({ ...newEffect, effectType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="ADD">Add</option>
                      <option value="MULTIPLY">Multiply</option>
                      <option value="DECAY">Decay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEffect.value}
                      onChange={(e) => setNewEffect({ ...newEffect, value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scope
                    </label>
                    <select
                      value={newEffect.scope}
                      onChange={(e) => setNewEffect({ ...newEffect, scope: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="GLOBAL">Global</option>
                      <option value="COHORT_TO_COHORT">Cohort to Cohort</option>
                      <option value="PERSON_TO_PERSON">Person to Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <select
                      value={newEffect.domain}
                      onChange={(e) => setNewEffect({ ...newEffect, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="KINSHIP">Kinship</option>
                      <option value="FACTION">Faction</option>
                      <option value="WORK">Work</option>
                    </select>
                  </div>
                </div>

                {newEffect.effectType === 'DECAY' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Decay Per Day
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEffect.decayPerDay}
                      onChange={(e) => setNewEffect({ ...newEffect, decayPerDay: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Add Effect
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEffectModal(false)
                      setSelectedEvent(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
