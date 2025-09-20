'use client'

import { useState, useEffect } from 'react'

interface Person {
  id: string
  name: string
  occupation: string
  faction?: {
    id: string
    name: string
  }
}

interface Faction {
  id: string
  name: string
  color?: string
}

interface BulkFactionAssignerProps {
  onClose: () => void
}

export default function BulkFactionAssigner({ onClose }: BulkFactionAssignerProps) {
  const [people, setPeople] = useState<Person[]>([])
  const [factions, setFactions] = useState<Faction[]>([])
  const [selectedPeople, setSelectedPeople] = useState<string[]>([])
  const [selectedFaction, setSelectedFaction] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [results, setResults] = useState<{success: number, failed: number}>({success: 0, failed: 0})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [peopleRes, factionsRes] = await Promise.all([
        fetch('/api/people'),
        fetch('/api/factions')
      ])

      const [peopleData, factionsData] = await Promise.all([
        peopleRes.json(),
        factionsRes.json()
      ])

      if (peopleData.success) setPeople(peopleData.data)
      if (factionsData.success) setFactions(factionsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePersonToggle = (personId: string) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    )
  }

  const handleSelectAll = () => {
    const villagerIds = people
      .filter(p => p.occupation === 'Villager (retired/aging)')
      .map(p => p.id)
    setSelectedPeople(villagerIds)
  }

  const handleDeselectAll = () => {
    setSelectedPeople([])
  }

  const assignFactions = async () => {
    if (!selectedFaction || selectedPeople.length === 0) return

    setAssigning(true)
    setResults({success: 0, failed: 0})

    let successCount = 0
    let failedCount = 0

    for (const personId of selectedPeople) {
      try {
        const response = await fetch('/api/memberships', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personId,
            factionId: selectedFaction,
            role: 'member',
            isPrimary: true,
            alignment: 75,
            openness: 60,
            notes: 'Bulk assigned via UI'
          })
        })

        const data = await response.json()
        if (data.ok) {
          successCount++
        } else {
          failedCount++
          console.error(`Failed to assign ${personId}:`, data.error)
        }
      } catch (error) {
        failedCount++
        console.error(`Error assigning ${personId}:`, error)
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setResults({success: successCount, failed: failedCount})
    setAssigning(false)
    
    // Refresh data to show updated factions
    await fetchData()
  }

  const villagers = people.filter(p => p.occupation === 'Villager (retired/aging)')

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Bulk Faction Assignment
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* People Selection */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Select People</h3>
                <div className="space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Select All Villagers
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {villagers.map((person) => (
                  <div
                    key={person.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedPeople.includes(person.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => handlePersonToggle(person.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm text-gray-600">
                          Current faction: {person.faction?.name || 'None'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedPeople.includes(person.id)}
                        onChange={() => handlePersonToggle(person.id)}
                        className="ml-2"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {selectedPeople.length} of {villagers.length} villagers selected
              </div>
            </div>

            {/* Faction Selection & Assignment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Assign Faction</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Faction</label>
                <select
                  value={selectedFaction}
                  onChange={(e) => setSelectedFaction(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Choose a faction...</option>
                  {factions.map(faction => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <button
                  onClick={assignFactions}
                  disabled={!selectedFaction || selectedPeople.length === 0 || assigning}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? 'Assigning...' : `Assign to ${factions.find(f => f.id === selectedFaction)?.name || 'Faction'}`}
                </button>
              </div>

              {results.success > 0 || results.failed > 0 ? (
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-medium mb-2">Assignment Results:</h4>
                  <div className="text-sm">
                    <div className="text-green-600">✅ Successful: {results.success}</div>
                    <div className="text-red-600">❌ Failed: {results.failed}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
