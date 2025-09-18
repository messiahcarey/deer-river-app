'use client'

import { useState, useEffect } from 'react'

interface Faction {
  id?: string
  name: string
  motto: string | null
  description: string | null
  color: string | null
  members?: Array<{
    id: string
    name: string
    species: string
  }>
}

interface FactionEditModalProps {
  faction: Faction | null
  onClose: () => void
  onSave: (updatedFaction: Partial<Faction>) => Promise<void>
}

export default function FactionEditModal({ faction, onClose, onSave }: FactionEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    motto: '',
    description: '',
    color: '#3b82f6'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (faction) {
      setFormData({
        name: faction.name || '',
        motto: faction.motto || '',
        description: faction.description || '',
        color: faction.color || '#3b82f6'
      })
    }
  }, [faction])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const updatedFaction = {
        ...faction,
        name: formData.name,
        motto: formData.motto || null,
        description: formData.description || null,
        color: formData.color
      }

      await onSave(updatedFaction)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setIsSaving(false)
    }
  }

  const predefinedColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
  ]

  const isEditing = faction?.id

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-2xl font-semibold text-gray-800">
            {isEditing ? `Edit ${faction?.name}` : 'Create New Faction'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Faction Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
                placeholder="e.g., Town Council"
              />
            </div>
            <div>
              <label htmlFor="motto" className="block text-sm font-medium text-gray-700">Motto</label>
              <input
                type="text"
                id="motto"
                name="motto"
                value={formData.motto}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="e.g., Order and Prosperity"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Describe the faction's purpose and role in Deer River..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Faction Color</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                placeholder="#3b82f6"
              />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-2">Quick colors:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {isEditing && faction?.members && faction.members.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Members ({faction.members.length})</h4>
              <div className="flex flex-wrap gap-2">
                {faction.members.map((member) => (
                  <span 
                    key={member.id}
                    className="text-xs bg-white px-2 py-1 rounded border"
                  >
                    {member.name} ({member.species})
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: To add or remove members, edit individual people and change their faction assignment.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Faction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
