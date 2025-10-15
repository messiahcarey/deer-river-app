'use client'

// Events management interface page
import { useState, useEffect } from 'react'

interface Event {
  id: string
  name: string
  category: string
  startsAt: string | null
  endsAt: string | null
  impact: Record<string, unknown>
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface EventFormData {
  name: string
  category: string
  startsAt: string
  endsAt: string
  impact: string
  notes: string
  triggerRecalculation: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    category: 'festival',
    startsAt: '',
    endsAt: '',
    impact: '{}',
    notes: '',
    triggerRecalculation: true
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/event')
      const result = await response.json()

      if (result.success) {
        setEvents(result.data.events || [])
      } else {
        setError(result.error || 'Failed to fetch events')
      }
    } catch (err) {
      console.error('Failed to fetch events:', err)
      setError('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setCreating(true)
      
      // Parse impact JSON
      let parsedImpact = {}
      try {
        parsedImpact = JSON.parse(formData.impact)
      } catch {
        throw new Error('Invalid JSON in impact field')
      }

      const response = await fetch('/api/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          startsAt: formData.startsAt || null,
          endsAt: formData.endsAt || null,
          impact: parsedImpact,
          notes: formData.notes || null,
          triggerRecalculation: formData.triggerRecalculation
        })
      })

      const result = await response.json()

      if (result.success) {
        setEvents(prev => [result.data.event, ...prev])
        setShowCreateForm(false)
        setFormData({
          name: '',
          category: 'festival',
          startsAt: '',
          endsAt: '',
          impact: '{}',
          notes: '',
          triggerRecalculation: true
        })
      } else {
        setError(result.error || 'Failed to create event')
      }
    } catch (err) {
      console.error('Failed to create event:', err)
      setError(err instanceof Error ? err.message : 'Failed to create event')
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      festival: 'bg-green-100 text-green-800',
      raid: 'bg-red-100 text-red-800',
      policy: 'bg-blue-100 text-blue-800',
      disaster: 'bg-yellow-100 text-yellow-800',
      market: 'bg-purple-100 text-purple-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      festival: '🎉',
      raid: '⚔️',
      policy: '📜',
      disaster: '🌪️',
      market: '🏪'
    }
    return icons[category as keyof typeof icons] || '📅'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create and manage events that impact involvement and loyalty scores
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="text-red-600">⚠️ {error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Create Event Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Event</h3>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter event name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="festival">Festival</option>
                      <option value="raid">Raid</option>
                      <option value="policy">Policy</option>
                      <option value="disaster">Disaster</option>
                      <option value="market">Market</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startsAt}
                        onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endsAt}
                        onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impact (JSON)
                    </label>
                    <textarea
                      value={formData.impact}
                      onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder='{"faction_boost": {"Guard": 0.1}, "sentiment": {"Corven": -0.2}}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Additional notes about the event"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="triggerRecalculation"
                      checked={formData.triggerRecalculation}
                      onChange={(e) => setFormData({ ...formData, triggerRecalculation: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="triggerRecalculation" className="ml-2 block text-sm text-gray-700">
                      Trigger score recalculation
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {creating ? 'Creating...' : 'Create Event'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Events ({events.length})
            </h3>
          </div>
          
          {events.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No events created yet.</p>
              <p className="text-sm">Create your first event to start tracking community impact.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getCategoryIcon(event.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{event.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Start:</span> {formatDate(event.startsAt)}
                          </div>
                          <div>
                            <span className="font-medium">End:</span> {formatDate(event.endsAt)}
                          </div>
                        </div>

                        {event.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {event.notes}
                          </div>
                        )}

                        {event.impact && Object.keys(event.impact).length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium text-sm text-gray-700">Impact:</span>
                            <div className="mt-1 text-xs bg-gray-100 p-2 rounded font-mono">
                              {JSON.stringify(event.impact, null, 2)}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500">
                          Created: {formatDate(event.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Impact Guide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Event Impact Guide</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>Events can impact involvement and loyalty scores through their <code>impact</code> field:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>faction_boost:</strong> Temporary increase in faction loyalty (e.g., <code>{"{\"Guard\": 0.1}"}</code>)</li>
              <li><strong>sentiment:</strong> Change in person-to-person sentiment (e.g., <code>{"{\"Corven\": -0.2}"}</code>)</li>
              <li><strong>involvement_boost:</strong> Temporary increase in involvement scores</li>
              <li><strong>decay_rate:</strong> How quickly the impact fades over time</li>
            </ul>
            <p className="mt-2">
              <strong>Example:</strong> <code>{"{\"faction_boost\": {\"Guard\": 0.1}, \"sentiment\": {\"Corven\": -0.2}, \"decay_rate\": 0.95}"}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}