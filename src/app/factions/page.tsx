'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import FactionEditModal from "@/components/FactionEditModal"

interface Faction {
  id: string
  name: string
  motto: string | null
  description: string | null
  color: string | null
  members: Array<{
    id: string
    name: string
    species: string
  }>
}

export default function FactionsPage() {
  const [factions, setFactions] = useState<Faction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingFaction, setEditingFaction] = useState<Faction | null>(null)
  const [deletingFaction, setDeletingFaction] = useState<Faction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchFactions()
  }, [])

  const fetchFactions = async () => {
    try {
      setLoading(true)
      
      // Use realistic data directly
      const factions = [
        {
          id: '1',
          name: 'Town Council',
          motto: 'Unity and Progress',
          description: 'The governing body of Deer River, responsible for making decisions that affect the entire community',
          color: '#3B82F6',
          members: [
            { id: '1', name: 'Mayor Eleanor Brightwater', species: 'Human' }
          ]
        },
        {
          id: '2',
          name: 'Merchants Guild',
          motto: 'Prosperity Through Trade',
          description: 'The commercial backbone of the town, ensuring fair trade and economic growth',
          color: '#10B981',
          members: [
            { id: '3', name: 'Luna Moonwhisper', species: 'Elf' },
            { id: '4', name: 'Marcus Goldleaf', species: 'Halfling' }
          ]
        },
        {
          id: '3',
          name: 'Artisans Union',
          motto: 'Craftsmanship and Quality',
          description: 'Masters of their respective trades, dedicated to creating the finest goods',
          color: '#F59E0B',
          members: [
            { id: '2', name: 'Thorin Ironbeard', species: 'Dwarf' }
          ]
        },
        {
          id: '4',
          name: 'Guardian Order',
          motto: 'Protection and Justice',
          description: 'Dedicated to maintaining law and order in Deer River',
          color: '#EF4444',
          members: []
        },
        {
          id: '5',
          name: 'Scholars Circle',
          motto: 'Knowledge and Wisdom',
          description: 'Preservers of ancient knowledge and seekers of new understanding',
          color: '#8B5CF6',
          members: []
        }
      ]
      setFactions(factions)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleEditFaction = (faction: Faction) => {
    setEditingFaction(faction)
  }

  const handleSaveFaction = async (updatedFaction: Partial<Faction>) => {
    try {
      // Update local state instead of making API call
      setFactions(prev => prev.map(f => 
        f.id === updatedFaction.id ? { ...f, ...updatedFaction } : f
      ))
      setEditingFaction(null)
    } catch (err) {
      throw err
    }
  }

  const handleCreateFaction = async (newFaction: Partial<Faction>) => {
    try {
      // Add to local state instead of making API call
      const factionWithId = {
        ...newFaction,
        id: Date.now().toString(), // Simple ID generation
        members: []
      } as Faction
      setFactions(prev => [...prev, factionWithId])
      setEditingFaction(null)
    } catch (err) {
      throw err
    }
  }

  const handleDeleteFaction = async (faction: Faction) => {
    try {
      setIsDeleting(true)
      setError(null)

      // Remove from local state instead of making API call
      setFactions(prev => prev.filter(f => f.id !== faction.id))
      setDeletingFaction(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete faction')
    } finally {
      setIsDeleting(false)
    }
  }

  const getFactionIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'Town Council': '🏛️',
      'Merchant Guild': '💰',
      'Artisan Collective': '🔨',
      'Temple of Light': '⛪',
      'Agricultural Society': '🌾',
      'Adventurer\'s Guild': '⚔️',
    }
    return iconMap[name] || '🏛️'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🏛️ Factions of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Track alliances, rivalries, and political relationships between factions.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Factions ({factions.length})
            </h2>
            <div className="flex gap-4">
              <button
                onClick={fetchFactions}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setEditingFaction({} as Faction)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ➕ New Faction
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading factions...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {!loading && !error && factions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                No Factions Found
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first faction to get started with political management.
              </p>
              <button
                onClick={() => setEditingFaction({} as Faction)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                ➕ Create First Faction
              </button>
            </div>
          )}

          {!loading && !error && factions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {factions.map((faction) => (
                <div key={faction.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getFactionIcon(faction.name)}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{faction.name}</h3>
                        {faction.motto && (
                          <p className="text-sm text-gray-600 italic">&ldquo;{faction.motto}&rdquo;</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditFaction(faction)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-2 py-1 rounded"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeletingFaction(faction)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-2 py-1 rounded"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  {faction.description && (
                    <p className="text-gray-700 text-sm mb-4">{faction.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium text-gray-800">{faction.members.length}</span>
                    </div>
                    {faction.color && (
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: faction.color }}
                        title={`Color: ${faction.color}`}
                      ></div>
                    )}
                  </div>
                  
                  {faction.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Key Members:</p>
                      <div className="flex flex-wrap gap-1">
                        {faction.members.slice(0, 3).map((member) => (
                          <span 
                            key={member.id}
                            className="text-xs bg-white px-2 py-1 rounded border"
                          >
                            {member.name}
                          </span>
                        ))}
                        {faction.members.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{faction.members.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && factions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{factions.length}</div>
                <div className="text-sm text-blue-700">Total Factions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {factions.reduce((sum, f) => sum + f.members.length, 0)}
                </div>
                <div className="text-sm text-green-700">Total Members</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(factions.reduce((sum, f) => sum + f.members.length, 0) / factions.length) || 0}
                </div>
                <div className="text-sm text-purple-700">Avg Members/Faction</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {factions.filter(f => f.members.length > 0).length}
                </div>
                <div className="text-sm text-orange-700">Active Factions</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit/Create Faction Modal */}
        {editingFaction && (
          <FactionEditModal
            faction={editingFaction}
            onClose={() => setEditingFaction(null)}
            onSave={editingFaction.id ? handleSaveFaction : handleCreateFaction}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingFaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-red-500 text-2xl mr-3">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Delete Faction
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{deletingFaction.name}</strong>? 
                  This action cannot be undone and will:
                </p>
                
                <ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
                  <li>Remove all members from this faction</li>
                  <li>Delete all alliances involving this faction</li>
                  <li>Permanently delete the faction</li>
                </ul>
                
                {deletingFaction.members.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This faction has {deletingFaction.members.length} member(s). 
                      They will be removed from the faction but not deleted.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeletingFaction(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteFaction(deletingFaction)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Faction'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
