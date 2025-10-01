'use client'

import React, { useState, useEffect } from 'react'
import DemographicsCharts from '@/components/DemographicsCharts'
import Breadcrumbs from '@/components/Breadcrumbs'

interface DemographicsData {
  summary: {
    totalPeople: number
    totalFactions: number
    totalLocations: number
    totalMemberships: number
    peopleWithoutHomes: number
    peopleWithoutWork: number
    peopleWithoutFaction: number
  }
  distributions: {
    factions: Array<{
      factionId: string
      factionName: string
      color: string
      count: number
    }>
    species: Array<{
      species: string
      count: number
    }>
    occupations: Array<{
      occupation: string
      count: number
    }>
  }
}

export default function DemographicsPage() {
  const [data, setData] = useState<DemographicsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard')
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch demographics data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Demographics', href: '/demographics' }
          ]} />
          
          <div className="mt-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
            <div className="text-center mt-4">
              <h2 className="text-xl font-semibold text-gray-700">Loading demographics data...</h2>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Demographics', href: '/demographics' }
          ]} />
          
          <div className="mt-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 text-xl mb-2">⚠️ Error Loading Data</div>
              <div className="text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[
            { label: 'Home', href: '/' },
            { label: 'Demographics', href: '/demographics' }
          ]} />
          
          <div className="mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-600 text-xl mb-2">📊 No Data Available</div>
              <div className="text-gray-700">No demographics data found.</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Demographics', href: '/demographics' }
        ]} />
        
        <div className="mt-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-4">
              📊 Population Demographics
            </h1>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Explore the population structure, species distribution, occupations, and faction dynamics of Deer River.
            </p>
          </div>

          <DemographicsCharts data={data} />
        </div>
      </div>
    </div>
  )
}
