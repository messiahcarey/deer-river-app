'use client'

import { useEffect, useState } from 'react'

type Faction = {
  id: string
  name: string
  color?: string
}

type Person = {
  id: string
  name: string
}

type Membership = {
  id: string
  role: string | null
  isPrimary: boolean
  alignment: number
  openness: number
  notes: string | null
  joinedAt: string
  leftAt: string | null
  faction: Faction
  person: Person
}

type FactionOpinion = {
  id: string
  score: number
  reason: string | null
  updatedAt: string
  faction: Faction
  person: Person
}

interface FactionMembershipPanelProps {
  personId: string
  personName: string
}

export default function FactionMembershipPanel({ personId, personName }: FactionMembershipPanelProps) {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [opinions, setOpinions] = useState<FactionOpinion[]>([])
  const [factions, setFactions] = useState<Faction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddMembership, setShowAddMembership] = useState(false)
  const [showAddOpinion, setShowAddOpinion] = useState(false)

  // Form states
  const [newMembership, setNewMembership] = useState({
    factionId: '',
    role: 'member',
    isPrimary: false,
    alignment: 0,
    openness: 50,
    notes: ''
  })

  const [newOpinion, setNewOpinion] = useState({
    factionId: '',
    score: 0,
    reason: ''
  })

  useEffect(() => {
    fetchData()
  }, [personId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [membershipsRes, opinionsRes, factionsRes] = await Promise.all([
        fetch(`/api/memberships?personId=${personId}&active=true`),
        fetch(`/api/faction-opinions?personId=${personId}`),
        fetch('/api/factions')
      ])

      const [membershipsData, opinionsData, factionsData] = await Promise.all([
        membershipsRes.json(),
        opinionsRes.json(),
        factionsRes.json()
      ])

      if (membershipsData.ok) setMemberships(membershipsData.data)
      if (opinionsData.ok) setOpinions(opinionsData.data)
      if (factionsData.ok) setFactions(factionsData.data)

      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateMembership = async (id: string, updates: Partial<Membership>) => {
    try {
      const response = await fetch(`/api/memberships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      if (data.ok) {
        setMemberships(prev => 
          prev.map(m => m.id === id ? { ...m, ...updates } : m)
        )
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const createMembership = async () => {
    try {
      const response = await fetch('/api/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          ...newMembership
        })
      })

      const data = await response.json()
      if (data.ok) {
        setMemberships(prev => [...prev, data.data])
        setNewMembership({
          factionId: '',
          role: 'member',
          isPrimary: false,
          alignment: 0,
          openness: 50,
          notes: ''
        })
        setShowAddMembership(false)
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const createOpinion = async () => {
    try {
      const response = await fetch('/api/faction-opinions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          ...newOpinion
        })
      })

      const data = await response.json()
      if (data.ok) {
        setOpinions(prev => {
          const existing = prev.find(o => o.faction.id === newOpinion.factionId)
          if (existing) {
            return prev.map(o => o.id === existing.id ? data.data : o)
          }
          return [...prev, data.data]
        })
        setNewOpinion({
          factionId: '',
          score: 0,
          reason: ''
        })
        setShowAddOpinion(false)
      } else {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 50) return 'text-green-600'
    if (alignment >= 0) return 'text-yellow-600'
    if (alignment >= -50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAlignmentLabel = (alignment: number) => {
    if (alignment >= 75) return 'Champion'
    if (alignment >= 50) return 'Supporter'
    if (alignment >= 25) return 'Favorable'
    if (alignment >= 0) return 'Neutral'
    if (alignment >= -25) return 'Unfavorable'
    if (alignment >= -50) return 'Opposed'
    return 'Hostile'
  }

  if (loading) return <div className="p-4">Loading faction relationships...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Faction Relationships</h3>
        <div className="space-x-2">
          <button
            onClick={() => setShowAddMembership(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Add Membership
          </button>
          <button
            onClick={() => setShowAddOpinion(true)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Add Opinion
          </button>
        </div>
      </div>

      {/* Memberships */}
      <div>
        <h4 className="font-medium mb-3">Faction Memberships</h4>
        {memberships.length === 0 ? (
          <p className="text-gray-500 italic">No faction memberships</p>
        ) : (
          <div className="space-y-3">
            {memberships.map((membership) => (
              <div key={membership.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: membership.faction.color || '#6b7280' }}
                    />
                    <span className="font-medium">{membership.faction.name}</span>
                    {membership.isPrimary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Primary
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {membership.role || 'member'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Alignment: {membership.alignment} ({getAlignmentLabel(membership.alignment)})
                    </label>
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      value={membership.alignment}
                      onChange={(e) => updateMembership(membership.id, { 
                        alignment: Number(e.target.value) 
                      })}
                      className="w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Openness: {membership.openness}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={membership.openness}
                      onChange={(e) => updateMembership(membership.id, { 
                        openness: Number(e.target.value) 
                      })}
                      className="w-full mt-1"
                    />
                  </div>
                </div>

                {membership.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>Notes:</strong> {membership.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Faction Opinions */}
      <div>
        <h4 className="font-medium mb-3">Faction Opinions</h4>
        {opinions.length === 0 ? (
          <p className="text-gray-500 italic">No faction opinions</p>
        ) : (
          <div className="space-y-2">
            {opinions.map((opinion) => (
              <div key={opinion.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: opinion.faction.color || '#6b7280' }}
                  />
                  <span className="font-medium">{opinion.faction.name}</span>
                  <span className={`font-medium ${getAlignmentColor(opinion.score)}`}>
                    {opinion.score} ({getAlignmentLabel(opinion.score)})
                  </span>
                </div>
                {opinion.reason && (
                  <span className="text-sm text-gray-600 italic">
                    {opinion.reason}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Membership Modal */}
      {showAddMembership && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Faction Membership</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Faction</label>
                <select
                  value={newMembership.factionId}
                  onChange={(e) => setNewMembership(prev => ({ ...prev, factionId: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a faction</option>
                  {factions.map(faction => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input
                  type="text"
                  value={newMembership.role}
                  onChange={(e) => setNewMembership(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="member, captain, leader, etc."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newMembership.isPrimary}
                  onChange={(e) => setNewMembership(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Primary faction</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Alignment: {newMembership.alignment}
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={newMembership.alignment}
                  onChange={(e) => setNewMembership(prev => ({ ...prev, alignment: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Openness: {newMembership.openness}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={newMembership.openness}
                  onChange={(e) => setNewMembership(prev => ({ ...prev, openness: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={newMembership.notes}
                  onChange={(e) => setNewMembership(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Optional notes about this membership..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddMembership(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createMembership}
                disabled={!newMembership.factionId}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Add Membership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Opinion Modal */}
      {showAddOpinion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Faction Opinion</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Faction</label>
                <select
                  value={newOpinion.factionId}
                  onChange={(e) => setNewOpinion(prev => ({ ...prev, factionId: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select a faction</option>
                  {factions.map(faction => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Opinion: {newOpinion.score} ({getAlignmentLabel(newOpinion.score)})
                </label>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={newOpinion.score}
                  onChange={(e) => setNewOpinion(prev => ({ ...prev, score: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={newOpinion.reason}
                  onChange={(e) => setNewOpinion(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Why does this person feel this way about the faction?"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddOpinion(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createOpinion}
                disabled={!newOpinion.factionId}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Add Opinion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
