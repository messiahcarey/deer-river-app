'use client'

import { useState } from 'react'
import Button from './Button'

interface Person {
  id: string
  name: string
  species: string
  age: number | null
  occupation: string | null
  livesAt: {
    id: string
    name: string
  } | null
  worksAt: {
    id: string
    name: string
  } | null
  memberships: Array<{
    faction: {
      id: string
      name: string
      color: string
    }
    isPrimary: boolean
  }>
}

interface BulkOperationsProps {
  selectedPeople: string[]
  people: Person[]
  onBulkAssignHousing: (personIds: string[], locationId: string) => void
  onBulkAssignFaction: (personIds: string[], factionId: string) => void
  onBulkUpdateStatus: (personIds: string[], status: string) => void
  onBulkDelete: (personIds: string[]) => void
  locations: Array<{ id: string; name: string }>
  factions: Array<{ id: string; name: string; color: string }>
}

export default function BulkOperations({
  selectedPeople,
  people,
  onBulkAssignHousing,
  onBulkAssignFaction,
  onBulkUpdateStatus,
  onBulkDelete,
  locations,
  factions
}: BulkOperationsProps) {
  const [showBulkMenu, setShowBulkMenu] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [selectedFactionId, setSelectedFactionId] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('present')

  const selectedPeopleData = people.filter(p => selectedPeople.includes(p.id))

  const handleBulkOperation = (operation: string) => {
    setSelectedOperation(operation)
    setShowBulkMenu(true)
  }

  const executeBulkOperation = () => {
    if (selectedPeople.length === 0) return

    switch (selectedOperation) {
      case 'assign-housing':
        if (selectedLocationId) {
          onBulkAssignHousing(selectedPeople, selectedLocationId)
        }
        break
      case 'assign-faction':
        if (selectedFactionId) {
          onBulkAssignFaction(selectedPeople, selectedFactionId)
        }
        break
      case 'update-status':
        onBulkUpdateStatus(selectedPeople, selectedStatus)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedPeople.length} people?`)) {
          onBulkDelete(selectedPeople)
        }
        break
    }

    setShowBulkMenu(false)
    setSelectedOperation(null)
  }

  if (selectedPeople.length === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-blue-600 mr-2">⚡</span>
          <span className="font-medium text-blue-900">
            {selectedPeople.length} people selected
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleBulkOperation('assign-housing')}
            variant="secondary"
            size="sm"
          >
            🏠 Assign Housing
          </Button>
          <Button
            onClick={() => handleBulkOperation('assign-faction')}
            variant="secondary"
            size="sm"
          >
            🏛️ Assign Faction
          </Button>
          <Button
            onClick={() => handleBulkOperation('update-status')}
            variant="secondary"
            size="sm"
          >
            📊 Update Status
          </Button>
          <Button
            onClick={() => handleBulkOperation('delete')}
            variant="danger"
            size="sm"
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Bulk Operation Details */}
      {showBulkMenu && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-4">
            Bulk {selectedOperation?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
          
          <div className="space-y-4">
            {/* Selected People Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected People ({selectedPeople.length}):
              </label>
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {selectedPeopleData.map(person => (
                    <div key={person.id} className="text-gray-600">
                      {person.name} ({person.species})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Operation-specific inputs */}
            {selectedOperation === 'assign-housing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Location:
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOperation === 'assign-faction' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Faction:
                </label>
                <select
                  value={selectedFactionId}
                  onChange={(e) => setSelectedFactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Faction</option>
                  {factions.map(faction => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOperation === 'update-status' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            )}

            {selectedOperation === 'delete' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  ⚠️ This will permanently delete {selectedPeople.length} people and all their data.
                  This action cannot be undone.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => setShowBulkMenu(false)}
              variant="secondary"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkOperation}
              variant={selectedOperation === 'delete' ? 'danger' : 'primary'}
              size="sm"
              disabled={
                (selectedOperation === 'assign-housing' && !selectedLocationId) ||
                (selectedOperation === 'assign-faction' && !selectedFactionId)
              }
            >
              Execute
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
