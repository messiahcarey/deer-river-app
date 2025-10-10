'use client'

import { useState } from 'react'
import { TrashIcon, PencilIcon, TagIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface BulkOperationsPanelProps<T> {
  selectedItems: T[]
  onBulkDelete?: (items: T[]) => void
  onBulkEdit?: (items: T[], field: string, value: any) => void
  onBulkAssignFaction?: (items: T[], factionId: string) => void
  onBulkAssignLocation?: (items: T[], locationId: string, type: 'livesAt' | 'worksAt') => void
  availableFactions?: Array<{ id: string; name: string; color: string | null }>
  availableLocations?: Array<{ id: string; name: string; kind: string }>
  className?: string
}

export default function BulkOperationsPanel<T extends { id: string }>({
  selectedItems,
  onBulkDelete,
  onBulkEdit,
  onBulkAssignFaction,
  onBulkAssignLocation,
  availableFactions = [],
  availableLocations = [],
  className = ''
}: BulkOperationsPanelProps<T>) {
  const [showOperations, setShowOperations] = useState(false)
  const [selectedFaction, setSelectedFaction] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [locationType, setLocationType] = useState<'livesAt' | 'worksAt'>('livesAt')
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')

  if (selectedItems.length === 0) return null

  const handleBulkDelete = () => {
    if (onBulkDelete && confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      onBulkDelete(selectedItems)
    }
  }

  const handleBulkEdit = () => {
    if (onBulkEdit && editField && editValue) {
      onBulkEdit(selectedItems, editField, editValue)
      setEditField('')
      setEditValue('')
    }
  }

  const handleBulkAssignFaction = () => {
    if (onBulkAssignFaction && selectedFaction) {
      onBulkAssignFaction(selectedItems, selectedFaction)
      setSelectedFaction('')
    }
  }

  const handleBulkAssignLocation = () => {
    if (onBulkAssignLocation && selectedLocation) {
      onBulkAssignLocation(selectedItems, selectedLocation, locationType)
      setSelectedLocation('')
    }
  }

  return (
    <div className={`bg-primary-50 border border-primary-200 rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
            {selectedItems.length}
          </div>
          <div>
            <h3 className="font-semibold text-primary-800">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </h3>
            <p className="text-sm text-primary-600">
              Choose an action to apply to all selected items
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowOperations(!showOperations)}
          className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
        >
          {showOperations ? 'Hide' : 'Show'} Operations
        </button>
      </div>

      {showOperations && (
        <div className="space-y-4">
          {/* Bulk Delete */}
          {onBulkDelete && (
            <div className="flex items-center gap-3 p-3 bg-danger-50 border border-danger-200 rounded-xl">
              <TrashIcon className="w-5 h-5 text-danger-600" />
              <div className="flex-1">
                <h4 className="font-medium text-danger-800">Delete Selected</h4>
                <p className="text-sm text-danger-600">Permanently remove all selected items</p>
              </div>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
              >
                Delete All
              </button>
            </div>
          )}

          {/* Bulk Edit */}
          {onBulkEdit && (
            <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl">
              <h4 className="font-medium text-secondary-800 mb-3">Bulk Edit</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={editField}
                  onChange={(e) => setEditField(e.target.value)}
                  className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select field...</option>
                  <option value="species">Species</option>
                  <option value="occupation">Occupation</option>
                  <option value="tags">Tags</option>
                  <option value="notes">Notes</option>
                </select>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="New value..."
                  className="px-3 py-2 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={handleBulkEdit}
                  disabled={!editField || !editValue}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Bulk Faction Assignment */}
          {onBulkAssignFaction && availableFactions.length > 0 && (
            <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl">
              <h4 className="font-medium text-accent-800 mb-3">Assign Faction</h4>
              <div className="flex gap-3">
                <select
                  value={selectedFaction}
                  onChange={(e) => setSelectedFaction(e.target.value)}
                  className="flex-1 px-3 py-2 border border-accent-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="">Select faction...</option>
                  {availableFactions.map(faction => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssignFaction}
                  disabled={!selectedFaction}
                  className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          )}

          {/* Bulk Location Assignment */}
          {onBulkAssignLocation && availableLocations.length > 0 && (
            <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
              <h4 className="font-medium text-success-800 mb-3">Assign Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value as 'livesAt' | 'worksAt')}
                  className="px-3 py-2 border border-success-200 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-success-500"
                >
                  <option value="livesAt">Lives At</option>
                  <option value="worksAt">Works At</option>
                </select>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border border-success-200 rounded-lg focus:ring-2 focus:ring-success-500 focus:border-success-500"
                >
                  <option value="">Select location...</option>
                  {availableLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.kind})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkAssignLocation}
                  disabled={!selectedLocation}
                  className="px-4 py-2 bg-success-500 text-white rounded-lg hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
