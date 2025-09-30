'use client'

import { useState, useEffect } from 'react'

interface Person {
  id: string
  name: string
  species: string
  age: number | null
  occupation: string | null
  notes: string | null
  tags: string
  livesAt: {
    id: string
    name: string
  } | null
  worksAt: {
    id: string
    name: string
  } | null
  household: {
    id: string
    name: string | null
  } | null
  memberships?: {
    id: string
    faction: {
      id: string
      name: string
      color: string | null
    }
    role: string
    isPrimary: boolean
  }[]
}

interface Location {
  id: string
  name: string
}

interface LocationData {
  id: string
  name: string
  kind: string
  address: string | null
  notes: string | null
  x: number | null
  y: number | null
}

interface Faction {
  id: string
  name: string
  color: string | null
}

interface PersonEditModalProps {
  person: Person | null
  locations: Location[]
  factions: Faction[]
  onClose: () => void
  onSave: (updatedPerson: Partial<Person>) => Promise<void>
  // Navigation props
  allPeople?: Person[]
  currentIndex?: number
  onNavigate?: (index: number) => void
  onLocationCreated?: () => void
}

export default function PersonEditModal({ person, locations, factions, onClose, onSave, allPeople, currentIndex, onNavigate, onLocationCreated }: PersonEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    age: '',
    occupation: '',
    notes: '',
    tags: 'present',
    factionIds: [] as string[],
    livesAtId: '',
    worksAtId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (person) {
      // Extract faction IDs from person's memberships
      const factionIds = person.memberships?.map(membership => membership.faction.id) || []
      
      setFormData({
        name: person.name || '',
        species: person.species || '',
        age: person.age?.toString() || '',
        occupation: person.occupation || '',
        notes: person.notes || '',
        tags: person.tags || 'present',
        factionIds: factionIds,
        livesAtId: person.livesAt?.id || '',
        worksAtId: person.worksAt?.id || ''
      })
    }
  }, [person])

  const handleFactionToggle = (factionId: string) => {
    setFormData(prev => ({
      ...prev,
      factionIds: prev.factionIds.includes(factionId)
        ? prev.factionIds.filter(id => id !== factionId)
        : [...prev.factionIds, factionId]
    }))
  }

  const autoSave = async () => {
    if (!person) return

    try {
      const updatedPerson = {
        ...person,
        name: formData.name,
        species: formData.species,
        age: formData.age ? parseInt(formData.age) : null,
        occupation: formData.occupation || null,
        notes: formData.notes || null,
        tags: formData.tags,
        factionIds: formData.factionIds,
        livesAtId: formData.livesAtId,
        worksAtId: formData.worksAtId || null
      }

      await onSave(updatedPerson)
    } catch (err) {
      console.error('Auto-save failed:', err)
      // Don't show error to user for auto-save, just log it
    }
  }

  const createHome = async () => {
    if (!person) return

    try {
      // First, get all existing locations to find the next number
      const response = await fetch('/api/locations')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error('Failed to fetch existing locations')
      }

      const existingLocations: LocationData[] = data.data || []
      
      // Find the next available number for "Private Residence"
      let nextNumber = 1
      const existingNumbers = existingLocations
        .filter((loc: LocationData) => loc.name.startsWith('Private Residence'))
        .map((loc: LocationData) => {
          const match = loc.name.match(/Private Residence (\d+)$/)
          return match ? parseInt(match[1]) : 0
        })
        .sort((a: number, b: number) => b - a)

      if (existingNumbers.length > 0) {
        nextNumber = existingNumbers[0] + 1
      }

      const homeName = `Private Residence ${nextNumber}`

      // Create the new home
      const createResponse = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: homeName,
          kind: 'building',
          address: `Home of ${person.name}`,
          notes: `Private residence for ${person.name}`,
          x: null,
          y: null
        })
      })

      const createData = await createResponse.json()
      
      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create home')
      }

      // Update the form to select the new home
      setFormData(prev => ({
        ...prev,
        livesAtId: createData.data.id
      }))

      // Refresh the locations list
      if (onLocationCreated) {
        onLocationCreated()
      }

      // Auto-save the person with the new home
      await autoSave()

    } catch (err) {
      console.error('Failed to create home:', err)
      alert(err instanceof Error ? err.message : 'Failed to create home')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!person) return

    setLoading(true)
    setError(null)

    try {
      const updatedPerson = {
        ...person,
        name: formData.name,
        species: formData.species,
        age: formData.age ? parseInt(formData.age) : null,
        occupation: formData.occupation || null,
        notes: formData.notes || null,
        tags: formData.tags,
        factionIds: formData.factionIds,
        livesAtId: formData.livesAtId,
        worksAtId: formData.worksAtId || null
      }

      await onSave(updatedPerson)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update person')
    } finally {
      setLoading(false)
    }
  }

  if (!person) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800">
                Edit Person: {person.name}
              </h2>
              {allPeople && currentIndex !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  {currentIndex + 1} of {allPeople.length} people
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Navigation buttons */}
              {allPeople && currentIndex !== undefined && onNavigate && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      await autoSave()
                      onNavigate(currentIndex - 1)
                    }}
                    disabled={currentIndex === 0}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await autoSave()
                      onNavigate(currentIndex + 1)
                    }}
                    disabled={currentIndex === allPeople.length - 1}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    Next →
                  </button>
                </>
              )}
              
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl ml-2"
              >
                ×
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Species *
                </label>
                <input
                  type="text"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factions
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {factions.map((faction) => (
                    <label key={faction.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.factionIds.includes(faction.id)}
                        onChange={() => handleFactionToggle(faction.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: faction.color || '#6B7280' }}
                        />
                        {faction.name}
                      </span>
                    </label>
                  ))}
                  {factions.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No factions available</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lives At *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.livesAtId}
                    onChange={(e) => setFormData({ ...formData, livesAtId: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={createHome}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    title="Create a new Private Residence for this person"
                  >
                    🏠 Create Home
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Works At
                </label>
                <select
                  value={formData.worksAtId}
                  onChange={(e) => setFormData({ ...formData, worksAtId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Workplace</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about this person..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
