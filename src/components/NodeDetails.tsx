'use client'

// Side panel for displaying detailed node information
import { useState, useEffect } from 'react'
import { NodeAttrs } from '@/types/graph'

interface NodeDetailsProps {
  node: NodeAttrs
  onClose: () => void
}

interface PersonDetails {
  id: string
  name: string
  species: string
  age: number
  occupation: string
  tags: string[]
  involvement: {
    score: number
    breakdown: {
      roleActivity: number
      eventParticipation: number
      networkCentrality: number
      initiative: number
      reliability: number
    }
  } | null
  loyaltyScores: Array<{
    targetId: string
    targetName: string
    score: number
  }>
  memberships: Array<{
    faction: { id: string; name: string; color: string }
    role: string
    isPrimary: boolean
  }>
  household: {
    id: string
    name: string
    residents: Array<{ id: string; name: string; species: string }>
  } | null
  workplace: {
    id: string
    name: string
    type: string
    workers: Array<{ id: string; name: string; species: string }>
  } | null
  relationships: Array<{
    id: string
    kind: string
    weight: number
    sentiment: number
    otherPerson: { id: string; name: string; species: string }
    direction: 'from' | 'to'
  }>
  networkMetrics: {
    totalRelationships: number
    averageRelationshipWeight: number
    averageSentiment: number
    relationshipTypes: Record<string, number>
  }
}

export function NodeDetails({ node, onClose }: NodeDetailsProps) {
  const [details, setDetails] = useState<PersonDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch detailed information for person nodes
  useEffect(() => {
    if (node.kind === 'person') {
      fetchPersonDetails()
    }
  }, [node])

  const fetchPersonDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Extract person ID from node key (format: "person:ID")
      const personId = node.key.replace('person:', '')
      
      const response = await fetch(`/api/person/${personId}/scores`)
      const result = await response.json()
      
      if (result.success) {
        setDetails(result.data)
      } else {
        setError(result.error || 'Failed to fetch person details')
      }
    } catch (err) {
      console.error('Failed to fetch person details:', err)
      setError('Failed to load person details')
    } finally {
      setLoading(false)
    }
  }

  const getNodeTypeLabel = (kind: string) => {
    const labels = {
      person: 'Person',
      faction: 'Faction',
      household: 'Household',
      workplace: 'Workplace'
    }
    return labels[kind as keyof typeof labels] || kind
  }

  const getNodeTypeColor = (kind: string) => {
    const colors = {
      person: '#4b7bec',
      faction: '#e67e22',
      household: '#16a085',
      workplace: '#8e44ad'
    }
    return colors[kind as keyof typeof colors] || '#95a5a6'
  }

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600'
    if (sentiment < -0.3) return 'text-red-600'
    return 'text-gray-600'
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.3) return 'Positive'
    if (sentiment < -0.3) return 'Negative'
    return 'Neutral'
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: getNodeTypeColor(node.kind) }}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{node.label}</h3>
            <p className="text-sm text-gray-500">{getNodeTypeLabel(node.kind)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Involvement:</span>
              <span className="font-medium">{formatScore(node.involvement || 0)}</span>
            </div>
            {node.tags.length > 0 && (
              <div>
                <span className="text-gray-600">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {node.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading details...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">⚠️ Error</div>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={fetchPersonDetails}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Person Details */}
        {details && (
          <>
            {/* Personal Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Species:</span>
                  <span className="font-medium">{details.species}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{details.age}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupation:</span>
                  <span className="font-medium">{details.occupation}</span>
                </div>
              </div>
            </div>

            {/* Involvement Breakdown */}
            {details.involvement && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Involvement Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role Activity:</span>
                    <span className="font-medium">{formatScore(details.involvement.breakdown.roleActivity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event Participation:</span>
                    <span className="font-medium">{formatScore(details.involvement.breakdown.eventParticipation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Centrality:</span>
                    <span className="font-medium">{formatScore(details.involvement.breakdown.networkCentrality)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Initiative:</span>
                    <span className="font-medium">{formatScore(details.involvement.breakdown.initiative)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reliability:</span>
                    <span className="font-medium">{formatScore(details.involvement.breakdown.reliability)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Faction Memberships */}
            {details.memberships.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Faction Memberships</h4>
                <div className="space-y-2">
                  {details.memberships.map(membership => (
                    <div key={membership.faction.id} className="flex items-center space-x-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: membership.faction.color }}
                      />
                      <span className="font-medium">{membership.faction.name}</span>
                      <span className="text-gray-500">({membership.role})</span>
                      {membership.isPrimary && (
                        <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Household */}
            {details.household && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Household</h4>
                <div className="text-sm">
                  <div className="font-medium">{details.household.name}</div>
                  <div className="text-gray-600 mt-1">
                    {details.household.residents.length} residents
                  </div>
                </div>
              </div>
            )}

            {/* Workplace */}
            {details.workplace && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Workplace</h4>
                <div className="text-sm">
                  <div className="font-medium">{details.workplace.name}</div>
                  <div className="text-gray-600 capitalize">{details.workplace.type}</div>
                  <div className="text-gray-600 mt-1">
                    {details.workplace.workers.length} workers
                  </div>
                </div>
              </div>
            )}

            {/* Top Loyalty Scores */}
            {details.loyaltyScores.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top Loyalties</h4>
                <div className="space-y-2">
                  {details.loyaltyScores.slice(0, 3).map(loyalty => (
                    <div key={loyalty.targetId} className="flex justify-between text-sm">
                      <span className="text-gray-600">{loyalty.targetName}</span>
                      <span className="font-medium">{formatScore(loyalty.score)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Network Metrics */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Network Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Relationships:</span>
                  <span className="font-medium">{details.networkMetrics.totalRelationships}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Relationship Weight:</span>
                  <span className="font-medium">{details.networkMetrics.averageRelationshipWeight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg. Sentiment:</span>
                  <span className={`font-medium ${getSentimentColor(details.networkMetrics.averageSentiment)}`}>
                    {getSentimentLabel(details.networkMetrics.averageSentiment)}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Relationships */}
            {details.relationships.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recent Relationships</h4>
                <div className="space-y-2">
                  {details.relationships.slice(0, 5).map(relationship => (
                    <div key={relationship.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{relationship.otherPerson.name}</span>
                        <span className={`${getSentimentColor(relationship.sentiment)}`}>
                          {getSentimentLabel(relationship.sentiment)}
                        </span>
                      </div>
                      <div className="text-gray-600 capitalize">
                        {relationship.kind} • Weight: {relationship.weight.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Non-person node info */}
        {node.kind !== 'person' && !loading && !error && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Node Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{node.kind}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Involvement:</span>
                <span className="font-medium">{formatScore(node.involvement || 0)}</span>
              </div>
              {node.tags.length > 0 && (
                <div>
                  <span className="text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {node.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
