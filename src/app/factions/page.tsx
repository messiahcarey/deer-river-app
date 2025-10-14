'use client'

import { useState, useEffect } from "react"
import FactionEditModal from "@/components/FactionEditModal"
import FactionRelationshipDiagram from "@/components/FactionRelationshipDiagram"

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
  const [viewingMembers, setViewingMembers] = useState<Faction | null>(null)

  useEffect(() => {
    fetchFactions()
  }, [])

  const fetchFactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/factions')
      const data = await response.json()
      
      if (data.success) {
        // Add empty members array to each faction if it doesn't exist
        const factionsWithMembers = data.data.map((faction: { id: string; name: string; motto: string | null; description: string | null; color: string | null; members?: Array<{ id: string; name: string; species: string }> }) => ({
          ...faction,
          members: faction.members || []
        }))
        setFactions(factionsWithMembers)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch factions')
      }
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
      const response = await fetch('/api/factions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFaction),
      })

      const data = await response.json()

      if (data.success) {
        // Update local state with the response data
        setFactions(prev => prev.map(f => 
          f.id === updatedFaction.id ? { ...f, ...data.data } : f
        ))
        setEditingFaction(null)
      } else {
        throw new Error(data.error || 'Failed to update faction')
      }
    } catch (err) {
      throw err
    }
  }

  const handleCreateFaction = async (newFaction: Partial<Faction>) => {
    try {
      const response = await fetch('/api/factions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFaction),
      })

      const data = await response.json()

      if (data.success) {
        // Add the new faction to local state
        const factionWithMembers = {
          ...data.data,
          members: []
        }
        setFactions(prev => [...prev, factionWithMembers])
        setEditingFaction(null)
      } else {
        throw new Error(data.error || 'Failed to create faction')
      }
    } catch (err) {
      throw err
    }
  }

  const handleDeleteFaction = async (faction: Faction) => {
    try {
      setIsDeleting(true)
      setError(null)

      // Make API call to delete the faction
      const response = await fetch('/api/factions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: faction.id })
      })

      const data = await response.json()

      if (data.success) {
        // Remove from local state after successful API deletion
        setFactions(prev => prev.filter(f => f.id !== faction.id))
        setDeletingFaction(null)
      } else {
        throw new Error(data.error || 'Failed to delete faction')
      }
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
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🏛️ Factions of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Track alliances, rivalries, and political relationships between factions.
          </p>
        </header>

        {/* Faction Relationship Diagram */}
        {!loading && !error && factions.length > 0 && (
          <div className="mb-6">
            <FactionRelationshipDiagram
              factions={factions?.map(faction => ({
                ...faction,
                members: (faction.members || []).map(member => ({
                  id: member.id,
                  name: member.name,
                  isPrimary: false // Default to false since we don't have this data
                }))
              }))}
              onFactionClick={(faction) => {
                // Convert the diagram faction back to the page faction type
                const pageFaction = factions.find(f => f.id === faction.id)
                if (pageFaction) {
                  setEditingFaction(pageFaction)
                }
              }}
              onFactionHover={() => {}}
              selectedFactionId={editingFaction?.id}
            />
          </div>
        )}

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
              {factions?.map((faction) => (
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
                          <button
                            onClick={() => setViewingMembers(faction)}
                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            +{faction.members.length - 3} more
                          </button>
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

        {/* Members Modal */}
        {viewingMembers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getFactionIcon(viewingMembers.name)}</span>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {viewingMembers.name} Members
                      </h3>
                      <p className="text-gray-600">
                        {viewingMembers.members.length} member{viewingMembers.members.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingMembers(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {viewingMembers.members.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">👥</div>
                      <p className="text-gray-600">No members in this faction</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {viewingMembers.members.map((member) => (
                        <div
                          key={member.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{member.name}</h4>
                              <p className="text-sm text-gray-600 capitalize">{member.species}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setViewingMembers(null)}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
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
