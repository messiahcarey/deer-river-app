'use client'

// Loyalty analysis page
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, LineChart, Line } from 'recharts'

interface LoyaltyData {
  personId: string
  personName: string
  targetId: string
  targetName: string
  score: number
  breakdown: {
    identityFit: number
    benefitFlow: number
    sharedHistory: number
    pressureCost: number
    satisfaction: number
  }
  updatedAt: string
}

interface LoyaltyStats {
  totalRelationships: number
  averageLoyalty: number
  loyaltyDistribution: Array<{ range: string; count: number }>
  topLoyalties: LoyaltyData[]
  componentAverages: {
    identityFit: number
    benefitFlow: number
    sharedHistory: number
    pressureCost: number
    satisfaction: number
  }
  factionLoyalties: Array<{ faction: string; averageLoyalty: number; memberCount: number }>
}

export default function LoyaltyPage() {
  const [data, setData] = useState<LoyaltyData[]>([])
  const [stats, setStats] = useState<LoyaltyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null)

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll create mock data since we need to enhance the API
      // In a real implementation, we'd fetch actual loyalty scores
      const mockData: LoyaltyData[] = [
        {
          personId: '1',
          personName: 'Rurik Copperpot',
          targetId: 'faction1',
          targetName: 'Guard Faction',
          score: 0.85,
          breakdown: {
            identityFit: 0.9,
            benefitFlow: 0.8,
            sharedHistory: 0.7,
            pressureCost: 0.9,
            satisfaction: 0.85
          },
          updatedAt: new Date().toISOString()
        },
        {
          personId: '2',
          personName: 'Elena Brightwater',
          targetId: 'faction2',
          targetName: 'Merchant Guild',
          score: 0.78,
          breakdown: {
            identityFit: 0.8,
            benefitFlow: 0.9,
            sharedHistory: 0.6,
            pressureCost: 0.7,
            satisfaction: 0.8
          },
          updatedAt: new Date().toISOString()
        },
        {
          personId: '3',
          personName: 'Thorin Ironbeard',
          targetId: 'faction1',
          targetName: 'Guard Faction',
          score: 0.72,
          breakdown: {
            identityFit: 0.7,
            benefitFlow: 0.6,
            sharedHistory: 0.8,
            pressureCost: 0.8,
            satisfaction: 0.7
          },
          updatedAt: new Date().toISOString()
        },
        {
          personId: '1',
          personName: 'Rurik Copperpot',
          targetId: 'faction3',
          targetName: 'Dwarf Clan',
          score: 0.65,
          breakdown: {
            identityFit: 0.9,
            benefitFlow: 0.4,
            sharedHistory: 0.8,
            pressureCost: 0.5,
            satisfaction: 0.6
          },
          updatedAt: new Date().toISOString()
        }
      ]

      setData(mockData)
      calculateStats(mockData)
    } catch (err) {
      console.error('Failed to fetch loyalty data:', err)
      setError('Failed to load loyalty data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (loyaltyData: LoyaltyData[]) => {
    const totalRelationships = loyaltyData.length
    const averageLoyalty = loyaltyData.reduce((sum, rel) => sum + rel.score, 0) / totalRelationships

    // Loyalty distribution
    const loyaltyDistribution = [
      { range: '0-20%', count: loyaltyData.filter(r => r.score < 0.2).length },
      { range: '20-40%', count: loyaltyData.filter(r => r.score >= 0.2 && r.score < 0.4).length },
      { range: '40-60%', count: loyaltyData.filter(r => r.score >= 0.4 && r.score < 0.6).length },
      { range: '60-80%', count: loyaltyData.filter(r => r.score >= 0.6 && r.score < 0.8).length },
      { range: '80-100%', count: loyaltyData.filter(r => r.score >= 0.8).length }
    ]

    // Top loyalties
    const topLoyalties = [...loyaltyData]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Component averages
    const componentAverages = {
      identityFit: loyaltyData.reduce((sum, r) => sum + r.breakdown.identityFit, 0) / totalRelationships,
      benefitFlow: loyaltyData.reduce((sum, r) => sum + r.breakdown.benefitFlow, 0) / totalRelationships,
      sharedHistory: loyaltyData.reduce((sum, r) => sum + r.breakdown.sharedHistory, 0) / totalRelationships,
      pressureCost: loyaltyData.reduce((sum, r) => sum + r.breakdown.pressureCost, 0) / totalRelationships,
      satisfaction: loyaltyData.reduce((sum, r) => sum + r.breakdown.satisfaction, 0) / totalRelationships
    }

    // Faction loyalties
    const factionMap = new Map<string, { total: number; count: number }>()
    loyaltyData.forEach(rel => {
      const existing = factionMap.get(rel.targetName) || { total: 0, count: 0 }
      factionMap.set(rel.targetName, {
        total: existing.total + rel.score,
        count: existing.count + 1
      })
    })

    const factionLoyalties = Array.from(factionMap.entries()).map(([faction, data]) => ({
      faction,
      averageLoyalty: data.total / data.count,
      memberCount: data.count
    })).sort((a, b) => b.averageLoyalty - a.averageLoyalty)

    setStats({
      totalRelationships,
      averageLoyalty,
      loyaltyDistribution,
      topLoyalties,
      componentAverages,
      factionLoyalties
    })
  }

  const formatScore = (score: number) => `${(score * 100).toFixed(1)}%`

  const getPersonLoyalties = (personId: string) => {
    return data.filter(rel => rel.personId === personId)
  }

  const getFactionLoyalties = (factionName: string) => {
    return data.filter(rel => rel.targetName === factionName)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading loyalty data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ Error</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchLoyaltyData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Loyalty Analysis</h1>
            <p className="mt-1 text-sm text-gray-600">
              Analyze faction loyalty and social alignment patterns across Deer River
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRelationships}</div>
              <div className="text-sm text-gray-600">Total Loyalty Relations</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{formatScore(stats.averageLoyalty)}</div>
              <div className="text-sm text-gray-600">Average Loyalty</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{stats.factionLoyalties.length}</div>
              <div className="text-sm text-gray-600">Active Factions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-orange-600">{formatScore(stats.componentAverages.identityFit)}</div>
              <div className="text-sm text-gray-600">Avg. Identity Fit</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Loyalty Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.loyaltyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#e67e22" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Component Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Averages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Identity Fit', value: stats?.componentAverages.identityFit || 0 },
                { name: 'Benefit Flow', value: stats?.componentAverages.benefitFlow || 0 },
                { name: 'Shared History', value: stats?.componentAverages.sharedHistory || 0 },
                { name: 'Pressure/Cost', value: stats?.componentAverages.pressureCost || 0 },
                { name: 'Satisfaction', value: stats?.componentAverages.satisfaction || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatScore(value as number)} />
                <Bar dataKey="value" fill="#16a085" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faction Loyalty Rankings */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Faction Loyalty Rankings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Loyalty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.factionLoyalties.map((faction, index) => (
                  <tr 
                    key={faction.faction}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedFaction === faction.faction ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedFaction(selectedFaction === faction.faction ? null : faction.faction)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-800">#{index + 1}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{faction.faction}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">{formatScore(faction.averageLoyalty)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{faction.memberCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-900 text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Loyalty Relationships */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Strongest Loyalty Relationships</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loyalty Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breakdown
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.topLoyalties.map((loyalty) => (
                  <tr 
                    key={`${loyalty.personId}-${loyalty.targetId}`}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedPerson === loyalty.personId ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedPerson(selectedPerson === loyalty.personId ? null : loyalty.personId)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{loyalty.personName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{loyalty.targetName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-orange-600">{formatScore(loyalty.score)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          IF: {formatScore(loyalty.breakdown.identityFit)}
                        </div>
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          BF: {formatScore(loyalty.breakdown.benefitFlow)}
                        </div>
                        <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          SH: {formatScore(loyalty.breakdown.sharedHistory)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Person/Faction Details */}
        {(selectedPerson || selectedFaction) && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedPerson ? `Loyalty Profile: ${data.find(d => d.personId === selectedPerson)?.personName}` : 
               selectedFaction ? `Faction Analysis: ${selectedFaction}` : ''}
            </h3>
            
            {selectedPerson && (
              <div className="space-y-4">
                {getPersonLoyalties(selectedPerson).map(loyalty => (
                  <div key={`${loyalty.personId}-${loyalty.targetId}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{loyalty.targetName}</h4>
                        <p className="text-sm text-gray-600">Loyalty: {formatScore(loyalty.score)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm font-bold text-blue-600">{formatScore(loyalty.breakdown.identityFit)}</div>
                        <div className="text-xs text-blue-800">Identity Fit</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm font-bold text-green-600">{formatScore(loyalty.breakdown.benefitFlow)}</div>
                        <div className="text-xs text-green-800">Benefit Flow</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-sm font-bold text-purple-600">{formatScore(loyalty.breakdown.sharedHistory)}</div>
                        <div className="text-xs text-purple-800">Shared History</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-sm font-bold text-orange-600">{formatScore(loyalty.breakdown.pressureCost)}</div>
                        <div className="text-xs text-orange-800">Pressure/Cost</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="text-sm font-bold text-red-600">{formatScore(loyalty.breakdown.satisfaction)}</div>
                        <div className="text-xs text-red-800">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedFaction && (
              <div className="space-y-4">
                {getFactionLoyalties(selectedFaction).map(loyalty => (
                  <div key={`${loyalty.personId}-${loyalty.targetId}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{loyalty.personName}</h4>
                        <p className="text-sm text-gray-600">Loyalty: {formatScore(loyalty.score)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm font-bold text-blue-600">{formatScore(loyalty.breakdown.identityFit)}</div>
                        <div className="text-xs text-blue-800">Identity Fit</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm font-bold text-green-600">{formatScore(loyalty.breakdown.benefitFlow)}</div>
                        <div className="text-xs text-green-800">Benefit Flow</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-sm font-bold text-purple-600">{formatScore(loyalty.breakdown.sharedHistory)}</div>
                        <div className="text-xs text-purple-800">Shared History</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-sm font-bold text-orange-600">{formatScore(loyalty.breakdown.pressureCost)}</div>
                        <div className="text-xs text-orange-800">Pressure/Cost</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="text-sm font-bold text-red-600">{formatScore(loyalty.breakdown.satisfaction)}</div>
                        <div className="text-xs text-red-800">Satisfaction</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formula Explanation */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-3">Loyalty Scoring Formula</h3>
          <div className="text-sm text-orange-800 space-y-2">
            <p><strong>L(target) = 0.25×IF + 0.25×BF + 0.20×SH + 0.15×PC + 0.15×SA</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>IF (Identity Fit):</strong> Kinship/household overlap, cultural affinity</li>
              <li><strong>BF (Benefit Flow):</strong> Material/social benefits from target</li>
              <li><strong>SH (Shared History):</strong> Length/depth of past cooperation</li>
              <li><strong>PC (Pressure/Cost):</strong> Penalties if defecting from target</li>
              <li><strong>SA (Satisfaction):</strong> Sentiment of recent interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
