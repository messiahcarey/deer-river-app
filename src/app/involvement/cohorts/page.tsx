'use client'

import React, { useState, useEffect } from 'react'
import { PrismaClient } from '@prisma/client'

interface Cohort {
  id: string
  name: string
  description: string | null
  color: string | null
  createdAt: Date
  updatedAt: Date
  people: Array<{
    id: string
    person: {
      id: string
      name: string
      species: string
    }
    joinedAt: Date
    notes: string | null
  }>
}

interface Person {
  id: string
  name: string
  species: string
}

export default function CohortsManager() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)

  // Form states
  const [newCohort, setNewCohort] = useState({
    name: '',
    description: '',
    color: '#8B4513'
  })

  const [assignmentForm, setAssignmentForm] = useState({
    personId: '',
    notes: ''
  })

  useEffect(() => {
    fetchCohorts()
    fetchPeople()
  }, [])

  const fetchCohorts = async () => {
    try {
      const response = await fetch('/api/cohorts')
      if (!response.ok) throw new Error('Failed to fetch cohorts')
      const data = await response.json()
      setCohorts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cohorts')
    }
  }

  const fetchPeople = async () => {
    try {
      const response = await fetch('/api/people')
      if (!response.ok) throw new Error('Failed to fetch people')
      const data = await response.json()
      setPeople(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load people')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCohort)
      })

      if (!response.ok) throw new Error('Failed to create cohort')
      
      await fetchCohorts()
      setShowCreateModal(false)
      setNewCohort({ name: '', description: '', color: '#8B4513' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cohort')
    }
  }

  const handleAssignPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCohort) return

    try {
      const response = await fetch('/api/cohorts/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cohortId: selectedCohort.id,
          personId: assignmentForm.personId,
          notes: assignmentForm.notes
        })
      })

      if (!response.ok) throw new Error('Failed to assign person')
      
      await fetchCohorts()
      setShowAssignModal(false)
      setAssignmentForm({ personId: '', notes: '' })
      setSelectedCohort(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign person')
    }
  }

  const handleRemovePerson = async (cohortId: string, personId: string) => {
    try {
      const response = await fetch('/api/cohorts/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId, personId })
      })

      if (!response.ok) throw new Error('Failed to remove person')
      
      await fetchCohorts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove person')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            👥 Cohorts Manager
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl">
            Manage people groups and their relationships in the involvement & loyalty system.
          </p>
        </header>

        {/* Create Cohort Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            + Create New Cohort
          </button>
        </div>

        {/* Cohorts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="bg-white rounded-lg shadow-lg p-6 border-l-4"
              style={{ borderLeftColor: cohort.color || '#8B4513' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{cohort.name}</h3>
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cohort.color || '#8B4513' }}
                ></span>
              </div>
              
              {cohort.description && (
                <p className="text-gray-600 mb-4">{cohort.description}</p>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  Members ({cohort.people.length})
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cohort.people.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between bg-gray-50 rounded p-2"
                    >
                      <div>
                        <p className="font-medium text-sm">{membership.person.name}</p>
                        <p className="text-xs text-gray-500">{membership.person.species}</p>
                      </div>
                      <button
                        onClick={() => handleRemovePerson(cohort.id, membership.person.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCohort(cohort)
                  setShowAssignModal(true)
                }}
                className="w-full px-4 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
              >
                + Add Member
              </button>
            </div>
          ))}
        </div>

        {/* Create Cohort Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Create New Cohort</h2>
              <form onSubmit={handleCreateCohort}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newCohort.name}
                    onChange={(e) => setNewCohort({ ...newCohort, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCohort.description}
                    onChange={(e) => setNewCohort({ ...newCohort, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newCohort.color}
                    onChange={(e) => setNewCohort({ ...newCohort, color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Person Modal */}
        {showAssignModal && selectedCohort && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                Add Member to {selectedCohort.name}
              </h2>
              <form onSubmit={handleAssignPerson}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Person
                  </label>
                  <select
                    value={assignmentForm.personId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, personId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select a person</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name} ({person.species})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    placeholder="Why is this person in this cohort?"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Add Member
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false)
                      setSelectedCohort(null)
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
