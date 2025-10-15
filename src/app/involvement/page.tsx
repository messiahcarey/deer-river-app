'use client'

// Involvement scoring dashboard page
import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface InvolvementData {
  personId: string
  name: string
  species: string
  occupation: string
  score: number
  breakdown: {
    roleActivity: number
    eventParticipation: number
    networkCentrality: number
    initiative: number
    reliability: number
  }
  updatedAt: string
}

interface InvolvementStats {
  totalPeople: number
  averageScore: number
  scoreDistribution: Array<{ range: string; count: number }>
  topPerformers: InvolvementData[]
  componentAverages: {
    roleActivity: number
    eventParticipation: number
    networkCentrality: number
    initiative: number
    reliability: number
  }
}

export default function InvolvementPage() {
  const [stats, setStats] = useState<InvolvementStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPerson, setSelectedPerson] = useState<InvolvementData | null>(null)

  const calculateStats = useCallback((involvementData: InvolvementData[]) => {
    const totalPeople = involvementData.length
    const averageScore = involvementData.reduce((sum, person) => sum + person.score, 0) / totalPeople

    // Score distribution
    const scoreDistribution = [
      { range: '0-20%', count: involvementData.filter(p => p.score < 0.2).length },
      { range: '20-40%', count: involvementData.filter(p => p.score >= 0.2 && p.score < 0.4).length },
      { range: '40-60%', count: involvementData.filter(p => p.score >= 0.4 && p.score < 0.6).length },
      { range: '60-80%', count: involvementData.filter(p => p.score >= 0.6 && p.score < 0.8).length },
      { range: '80-100%', count: involvementData.filter(p => p.score >= 0.8).length }
    ]

    // Top performers
    const topPerformers = [...involvementData]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // Component averages
    const componentAverages = {
      roleActivity: involvementData.reduce((sum, p) => sum + p.breakdown.roleActivity, 0) / totalPeople,
      eventParticipation: involvementData.reduce((sum, p) => sum + p.breakdown.eventParticipation, 0) / totalPeople,
      networkCentrality: involvementData.reduce((sum, p) => sum + p.breakdown.networkCentrality, 0) / totalPeople,
      initiative: involvementData.reduce((sum, p) => sum + p.breakdown.initiative, 0) / totalPeople,
      reliability: involvementData.reduce((sum, p) => sum + p.breakdown.reliability, 0) / totalPeople
    }

    setStats({
      totalPeople,
      averageScore,
      scoreDistribution,
      topPerformers,
      componentAverages
    })
  }, [])

  const fetchInvolvementData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll create mock data since we need to enhance the API
      // In a real implementation, we'd fetch actual involvement scores
      const mockData: InvolvementData[] = [
        {
          personId: '1',
          name: 'Rurik Copperpot',
          species: 'Dwarf',
          occupation: 'Guard',
          score: 0.85,
          breakdown: {
            roleActivity: 0.9,
            eventParticipation: 0.8,
            networkCentrality: 0.7,
            initiative: 0.9,
            reliability: 0.85
          },
          updatedAt: new Date().toISOString()
        },
        {
          personId: '2',
          name: 'Elena Brightwater',
          species: 'Human',
          occupation: 'Merchant',
          score: 0.72,
          breakdown: {
            roleActivity: 0.8,
            eventParticipation: 0.6,
            networkCentrality: 0.8,
            initiative: 0.7,
            reliability: 0.75
          },
          updatedAt: new Date().toISOString()
        },
        {
          personId: '3',
          name: 'Thorin Ironbeard',
          species: 'Dwarf',
          occupation: 'Blacksmith',
          score: 0.68,
          breakdown: {
            roleActivity: 0.7,
            eventParticipation: 0.5,
            networkCentrality: 0.6,
            initiative: 0.8,
            reliability: 0.7
          },
          updatedAt: new Date().toISOString()
        }
      ]

      calculateStats(mockData)
    } catch (err) {
      console.error('Failed to fetch involvement data:', err)
      setError('Failed to load involvement data')
    } finally {
      setLoading(false)
    }
  }, [calculateStats])

  useEffect(() => {
    fetchInvolvementData()
  }, [fetchInvolvementData])

  const formatScore = (score: number) => `${(score * 100).toFixed(1)}%`

  const COLORS = ['#4b7bec', '#e67e22', '#16a085', '#8e44ad', '#e74c3c']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading involvement data...</p>
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
            onClick={fetchInvolvementData}
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
            <h1 className="text-2xl font-bold text-gray-900">Involvement Scoring</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track civic engagement and community participation across Deer River
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
              <div className="text-2xl font-bold text-gray-900">{stats.totalPeople}</div>
              <div className="text-sm text-gray-600">Total People</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{formatScore(stats.averageScore)}</div>
              <div className="text-sm text-gray-600">Average Involvement</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{stats.topPerformers.length}</div>
              <div className="text-sm text-gray-600">High Performers</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-orange-600">{formatScore(stats.componentAverages.roleActivity)}</div>
              <div className="text-sm text-gray-600">Avg. Role Activity</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Score Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4b7bec" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Component Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Averages</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Role Activity', value: stats?.componentAverages.roleActivity || 0 },
                    { name: 'Event Participation', value: stats?.componentAverages.eventParticipation || 0 },
                    { name: 'Network Centrality', value: stats?.componentAverages.networkCentrality || 0 },
                    { name: 'Initiative', value: stats?.componentAverages.initiative || 0 },
                    { name: 'Reliability', value: stats?.componentAverages.reliability || 0 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => `${props.name} ${((props.percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1, 2, 3, 4].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatScore(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Species
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Breakdown
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.topPerformers.map((person) => (
                  <tr 
                    key={person.personId}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedPerson?.personId === person.personId ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedPerson(selectedPerson?.personId === person.personId ? null : person)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.species}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.occupation}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{formatScore(person.score)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          RA: {formatScore(person.breakdown.roleActivity)}
                        </div>
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          EP: {formatScore(person.breakdown.eventParticipation)}
                        </div>
                        <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          NC: {formatScore(person.breakdown.networkCentrality)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Person Details */}
        {selectedPerson && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Breakdown: {selectedPerson.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{formatScore(selectedPerson.breakdown.roleActivity)}</div>
                <div className="text-sm text-blue-800">Role Activity</div>
                <div className="text-xs text-blue-600 mt-1">Recurring duties & tasks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatScore(selectedPerson.breakdown.eventParticipation)}</div>
                <div className="text-sm text-green-800">Event Participation</div>
                <div className="text-xs text-green-600 mt-1">Attendance & initiative</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatScore(selectedPerson.breakdown.networkCentrality)}</div>
                <div className="text-sm text-purple-800">Network Centrality</div>
                <div className="text-xs text-purple-600 mt-1">Social connections</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{formatScore(selectedPerson.breakdown.initiative)}</div>
                <div className="text-sm text-orange-800">Initiative</div>
                <div className="text-xs text-orange-600 mt-1">Proactive actions</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{formatScore(selectedPerson.breakdown.reliability)}</div>
                <div className="text-sm text-red-800">Reliability</div>
                <div className="text-xs text-red-600 mt-1">Task completion</div>
              </div>
            </div>
          </div>
        )}

        {/* Formula Explanation */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Involvement Scoring Formula</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>I = 0.35×RA + 0.25×EP + 0.20×NC + 0.10×IN + 0.10×RE</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>RA (Role Activity):</strong> Recurring duties like guard shifts, shopkeeping</li>
              <li><strong>EP (Event Participation):</strong> Attendance and initiative in community events</li>
              <li><strong>NC (Network Centrality):</strong> Graph-based centrality percentile in social network</li>
              <li><strong>IN (Initiative):</strong> Number and impact of initiated actions</li>
              <li><strong>RE (Reliability):</strong> Completion rate for assigned tasks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}