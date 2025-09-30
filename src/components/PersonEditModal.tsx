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
  faction: {
    id: string
    name: string
    color: string | null
  } | null
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
}

interface Location {
  id: string
  name: string
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
}

export default function PersonEditModal({ person, locations, factions, onClose, onSave }: PersonEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    age: '',
    occupation: '',
    notes: '',
    tags: 'present',
    factionId: '',
    livesAtId: '',
    worksAtId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        species: person.species || '',
        age: person.age?.toString() || '',
        occupation: person.occupation || '',
        notes: person.notes || '',
        tags: person.tags || 'present',
        factionId: person.faction?.id || '',
        livesAtId: person.livesAt?.id || '',
        worksAtId: person.worksAt?.id || ''
      })
    }
  }, [person])

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
        factionId: formData.factionId || null,
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
            <h2 className="text-2xl font-semibold text-gray-800">
              Edit Person: {person.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
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
                  Faction
                </label>
                <select
                  value={formData.factionId}
                  onChange={(e) => setFormData({ ...formData, factionId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No Faction</option>
                  {factions.map((faction) => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lives At *
                </label>
                <select
                  value={formData.livesAtId}
                  onChange={(e) => setFormData({ ...formData, livesAtId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
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
