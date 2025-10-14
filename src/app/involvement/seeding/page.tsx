'use client'

import React, { useState, useEffect } from 'react'

interface SeedingPolicy {
  id: string
  name: string
  description: string | null
  sourceCohort: {
    id: string
    name: string
    color: string | null
  }
  targetCohort: {
    id: string
    name: string
    color: string | null
  }
  domain: string
  probability: number
  involvementLevel: string
  scoreMin: number
  scoreMax: number
  worldSeed: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface SeedingResult {
  success: boolean
  relationshipsCreated: number
  errors: string[]
  details: Array<{
    policyName: string
    sourceCohort: string
    targetCohort: string
    relationshipsGenerated: number
  }>
}

export default function SeedingConsole() {
  const [policies, setPolicies] = useState<SeedingPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewResult, setPreviewResult] = useState<SeedingResult | null>(null)
  const [seedingInProgress, setSeedingInProgress] = useState(false)

  // Form states
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    sourceCohortId: '',
    targetCohortId: '',
    domain: 'KINSHIP',
    probability: 0.5,
    involvementLevel: 'FRIEND',
    scoreMin: 40,
    scoreMax: 80,
    worldSeed: 'default-world'
  })

  const [seedingForm, setSeedingForm] = useState({
    worldSeed: 'default-world',
    dryRun: true
  })

  useEffect(() => {
    fetchPolicies()
  }, [])

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/seeding-policies')
      if (!response.ok) throw new Error('Failed to fetch policies')
      const data = await response.json()
      setPolicies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/seeding-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      })

      if (!response.ok) throw new Error('Failed to create policy')
      
      await fetchPolicies()
      setShowCreateModal(false)
      setNewPolicy({
        name: '',
        description: '',
        sourceCohortId: '',
        targetCohortId: '',
        domain: 'KINSHIP',
        probability: 0.5,
        involvementLevel: 'FRIEND',
        scoreMin: 40,
        scoreMax: 80,
        worldSeed: 'default-world'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create policy')
    }
  }

  const handlePreviewSeeding = async () => {
    try {
      setSeedingInProgress(true)
      const response = await fetch('/api/seed/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldSeed: seedingForm.worldSeed,
          dryRun: true
        })
      })

      if (!response.ok) throw new Error('Failed to preview seeding')
      
      const result = await response.json()
      setPreviewResult(result)
      setShowPreviewModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview seeding')
    } finally {
      setSeedingInProgress(false)
    }
  }

  const handleExecuteSeeding = async () => {
    try {
      setSeedingInProgress(true)
      const response = await fetch('/api/seed/relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldSeed: seedingForm.worldSeed,
          dryRun: false
        })
      })

      if (!response.ok) throw new Error('Failed to execute seeding')
      
      const result = await response.json()
      setPreviewResult(result)
      setShowPreviewModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute seeding')
    } finally {
      setSeedingInProgress(false)
    }
  }

  const togglePolicyStatus = async (policyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/seeding-policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (!response.ok) throw new Error('Failed to update policy')
      
      await fetchPolicies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update policy')
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
            🌱 Seeding Console
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl">
            Manage seeding policies and generate relationships between people based on their cohorts.
          </p>
        </header>

        {/* Seeding Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Seeding Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                World Seed
              </label>
              <input
                type="text"
                value={seedingForm.worldSeed}
                onChange={(e) => setSeedingForm({ ...seedingForm, worldSeed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter world seed for deterministic generation"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={seedingForm.dryRun}
                  onChange={(e) => setSeedingForm({ ...seedingForm, dryRun: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Dry Run (Preview Only)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviewSeeding}
                disabled={seedingInProgress}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {seedingInProgress ? 'Previewing...' : 'Preview'}
              </button>
              <button
                onClick={handleExecuteSeeding}
                disabled={seedingInProgress || seedingForm.dryRun}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {seedingInProgress ? 'Seeding...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>

        {/* Policies Management */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Seeding Policies</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            + Create Policy
          </button>
        </div>

        {/* Policies List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${
                policy.isActive ? 'border-green-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{policy.name}</h3>
                <button
                  onClick={() => togglePolicyStatus(policy.id, policy.isActive)}
                  className={`px-3 py-1 rounded text-sm ${
                    policy.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {policy.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              
              {policy.description && (
                <p className="text-gray-600 mb-4">{policy.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Source Cohort</p>
                  <p className="font-medium">{policy.sourceCohort.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Target Cohort</p>
                  <p className="font-medium">{policy.targetCohort.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Domain</p>
                  <p className="font-medium">{policy.domain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Probability</p>
                  <p className="font-medium">{(policy.probability * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Score Range</p>
                  <p className="font-medium">{policy.scoreMin} - {policy.scoreMax}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Involvement Level</p>
                  <p className="font-medium">{policy.involvementLevel}</p>
                </div>
              </div>

              {policy.worldSeed && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">World Seed</p>
                  <p className="font-medium text-xs bg-gray-100 p-2 rounded">{policy.worldSeed}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Policy Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create Seeding Policy</h2>
              <form onSubmit={handleCreatePolicy}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newPolicy.name}
                      onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain
                    </label>
                    <select
                      value={newPolicy.domain}
                      onChange={(e) => setNewPolicy({ ...newPolicy, domain: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="KINSHIP">Kinship</option>
                      <option value="FACTION">Faction</option>
                      <option value="WORK">Work</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source Cohort
                    </label>
                    <select
                      value={newPolicy.sourceCohortId}
                      onChange={(e) => setNewPolicy({ ...newPolicy, sourceCohortId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">Select source cohort</option>
                      {/* Cohorts would be loaded here */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Cohort
                    </label>
                    <select
                      value={newPolicy.targetCohortId}
                      onChange={(e) => setNewPolicy({ ...newPolicy, targetCohortId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">Select target cohort</option>
                      {/* Cohorts would be loaded here */}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Probability (0.0 - 1.0)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={newPolicy.probability}
                      onChange={(e) => setNewPolicy({ ...newPolicy, probability: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Involvement Level
                    </label>
                    <select
                      value={newPolicy.involvementLevel}
                      onChange={(e) => setNewPolicy({ ...newPolicy, involvementLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="ACQUAINTANCE">Acquaintance</option>
                      <option value="FRIEND">Friend</option>
                      <option value="ALLY">Ally</option>
                      <option value="RIVAL">Rival</option>
                      <option value="ENEMY">Enemy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Score
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPolicy.scoreMin}
                      onChange={(e) => setNewPolicy({ ...newPolicy, scoreMin: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Score
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newPolicy.scoreMax}
                      onChange={(e) => setNewPolicy({ ...newPolicy, scoreMax: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      World Seed
                    </label>
                    <input
                      type="text"
                      value={newPolicy.worldSeed}
                      onChange={(e) => setNewPolicy({ ...newPolicy, worldSeed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                  >
                    Create Policy
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

        {/* Preview Modal */}
        {showPreviewModal && previewResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {seedingForm.dryRun ? 'Seeding Preview' : 'Seeding Results'}
              </h2>
              
              <div className="mb-4">
                <p className="text-lg">
                  <span className="font-semibold">Relationships Created:</span> {previewResult.relationshipsCreated}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Success:</span> {previewResult.success ? 'Yes' : 'No'}
                </p>
              </div>

              {previewResult.details.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Policy Results:</h3>
                  <div className="space-y-2">
                    {previewResult.details.map((detail, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{detail.policyName}</p>
                        <p className="text-sm text-gray-600">
                          {detail.sourceCohort} → {detail.targetCohort}: {detail.relationshipsGenerated} relationships
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewResult.errors.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-red-600">Errors:</h3>
                  <div className="space-y-1">
                    {previewResult.errors.map((error, index) => (
                      <p key={index} className="text-red-600 text-sm">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
