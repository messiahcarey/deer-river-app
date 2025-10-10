'use client'

import { useState, useEffect, useMemo } from 'react'
import EnhancedDataTable from '@/components/EnhancedDataTable'
import BulkOperationsPanel from '@/components/BulkOperationsPanel'
import ColumnManager from '@/components/ColumnManager'
import PersonEditModal from '@/components/PersonEditModal'

interface Person {
  id: string
  name: string
  species: string
  age: number | null
  occupation: string | null
  notes: string | null
  tags: string
  livesAt: {
    id: string
    name: string
  } | null
  worksAt: {
    id: string
    name: string
  } | null
  household: {
    id: string
    name: string | null
  } | null
  memberships?: {
    id: string
    faction: {
      id: string
      name: string
      color: string | null
    }
    role: string
    isPrimary: boolean
  }[]
}

export default function PeopleEnhancedPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([])
  const [factions, setFactions] = useState<Array<{id: string; name: string; color: string | null}>>([])
  const [locations, setLocations] = useState<Array<{id: string; name: string; kind: string}>>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [columnOrder, setColumnOrder] = useState<string[]>([])

  // Initialize column configuration
  const columns = useMemo(() => [
    {
      key: 'name' as keyof Person,
      label: 'Name',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
      render: (value: string, row: Person) => (
        <div className="font-medium text-secondary-900">{value}</div>
      )
    },
    {
      key: 'species' as keyof Person,
      label: 'Species',
      sortable: true,
      filterable: true,
      filterType: 'multiselect' as const,
      filterOptions: [...new Set(people.map(p => p.species))].map(s => ({ value: s, label: s })),
      render: (value: string) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          {value}
        </span>
      )
    },
    {
      key: 'age' as keyof Person,
      label: 'Age',
      sortable: true,
      filterable: true,
      filterType: 'number' as const,
      render: (value: number | null) => (
        <span className="text-secondary-600">{value || 'Unknown'}</span>
      )
    },
    {
      key: 'occupation' as keyof Person,
      label: 'Occupation',
      sortable: true,
      filterable: true,
      filterType: 'multiselect' as const,
      filterOptions: [...new Set(people.map(p => p.occupation).filter(Boolean))].map(o => ({ value: o!, label: o! })),
      render: (value: string | null) => (
        <span className="text-secondary-600">{value || 'Unemployed'}</span>
      )
    },
    {
      key: 'tags' as keyof Person,
      label: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'multiselect' as const,
      filterOptions: [...new Set(people.map(p => p.tags))].map(t => ({ value: t, label: t })),
      render: (value: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 'present' 
            ? 'bg-success-100 text-success-800' 
            : value === 'absent'
            ? 'bg-danger-100 text-danger-800'
            : 'bg-secondary-100 text-secondary-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'livesAt' as keyof Person,
      label: 'Lives At',
      sortable: true,
      filterable: true,
      filterType: 'multiselect' as const,
      filterOptions: locations.map(l => ({ value: l.id, label: l.name })),
      render: (value: Person['livesAt']) => (
        <span className="text-secondary-600">{value?.name || 'Homeless'}</span>
      )
    },
    {
      key: 'worksAt' as keyof Person,
      label: 'Works At',
      sortable: true,
      filterable: true,
      filterType: 'multiselect' as const,
      filterOptions: locations.map(l => ({ value: l.id, label: l.name })),
      render: (value: Person['worksAt']) => (
        <span className="text-secondary-600">{value?.name || 'Unemployed'}</span>
      )
    },
    {
      key: 'memberships' as keyof Person,
      label: 'Factions',
      sortable: false,
      filterable: true,
      filterType: 'multiselect' as const,
      filterOptions: factions.map(f => ({ value: f.id, label: f.name })),
      render: (value: Person['memberships']) => (
        <div className="flex flex-wrap gap-1">
          {value?.map(membership => (
            <span
              key={membership.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: membership.faction.color ? `${membership.faction.color}20` : '#f3f4f6',
                color: membership.faction.color || '#374151'
              }}
            >
              {membership.faction.name}
              {membership.isPrimary && ' (Primary)'}
            </span>
          )) || <span className="text-secondary-400 text-xs">No factions</span>}
        </div>
      )
    }
  ], [people, factions, locations])

  // Initialize column visibility and order
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {}
    const initialOrder: string[] = []
    
    columns.forEach(col => {
      const key = String(col.key)
      initialVisibility[key] = !col.hidden
      initialOrder.push(key)
    })
    
    setColumnVisibility(initialVisibility)
    setColumnOrder(initialOrder)
  }, [columns])

  useEffect(() => {
    fetchPeople()
    fetchFactions()
    fetchLocations()
  }, [])

  const fetchPeople = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/people')
      if (!response.ok) throw new Error('Failed to fetch people')
      const data = await response.json()
      setPeople(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch people')
    } finally {
      setLoading(false)
    }
  }

  const fetchFactions = async () => {
    try {
      const response = await fetch('/api/factions')
      if (!response.ok) throw new Error('Failed to fetch factions')
      const data = await response.json()
      setFactions(data)
    } catch (err) {
      console.error('Failed to fetch factions:', err)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (!response.ok) throw new Error('Failed to fetch locations')
      const data = await response.json()
      setLocations(data)
    } catch (err) {
      console.error('Failed to fetch locations:', err)
    }
  }

  const handlePersonSelect = (person: Person, selected: boolean) => {
    if (selected) {
      setSelectedPeople(prev => [...prev, person])
    } else {
      setSelectedPeople(prev => prev.filter(p => p.id !== person.id))
    }
  }

  const handleBulkDelete = async (items: Person[]) => {
    try {
      for (const person of items) {
        const response = await fetch(`/api/people/${person.id}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error(`Failed to delete ${person.name}`)
      }
      setPeople(prev => prev.filter(p => !items.some(item => item.id === p.id)))
      setSelectedPeople([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete people')
    }
  }

  const handleBulkEdit = async (items: Person[], field: string, value: string) => {
    try {
      for (const person of items) {
        const response = await fetch(`/api/people/${person.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [field]: value })
        })
        if (!response.ok) throw new Error(`Failed to update ${person.name}`)
      }
      await fetchPeople() // Refresh data
      setSelectedPeople([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update people')
    }
  }

  const handleColumnToggle = (columnKey: string, visible: boolean) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnKey]: visible
    }))
  }

  const handleColumnReorder = (fromIndex: number, toIndex: number) => {
    setColumnOrder(prev => {
      const newOrder = [...prev]
      const [removed] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, removed)
      return newOrder
    })
  }

  const handlePersonSave = async (personData: any) => {
    try {
      const response = await fetch(`/api/people/${personData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData)
      })
      if (!response.ok) throw new Error('Failed to save person')
      await fetchPeople()
      setEditingPerson(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save person')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-danger-50 border border-danger-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-danger-800 mb-2">Error</h2>
            <p className="text-danger-600">{error}</p>
            <button
              onClick={fetchPeople}
              className="mt-4 px-4 py-2 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent mb-2">
            People Management
          </h1>
          <p className="text-lg text-secondary-600">
            Manage the citizens of Deer River with advanced filtering and bulk operations
          </p>
        </div>

        {/* Bulk Operations Panel */}
        {selectedPeople.length > 0 && (
          <BulkOperationsPanel
            selectedItems={selectedPeople}
            onBulkDelete={handleBulkDelete}
            onBulkEdit={handleBulkEdit}
            availableFactions={factions}
            availableLocations={locations}
            className="mb-6"
          />
        )}

        {/* Column Manager */}
        <div className="mb-6 flex justify-end">
          <ColumnManager
            columns={columns.map(col => ({ key: String(col.key), label: col.label, hidden: !columnVisibility[String(col.key)] }))}
            onColumnToggle={handleColumnToggle}
            onColumnReorder={handleColumnReorder}
          />
        </div>

        {/* Enhanced Data Table */}
        <EnhancedDataTable
          data={people}
          columns={columns.filter(col => columnVisibility[String(col.key)])}
          onRowClick={(person) => setEditingPerson(person)}
          onRowSelect={handlePersonSelect}
          selectedRows={selectedPeople}
          selectable={true}
          searchable={true}
          pagination={true}
          pageSize={25}
          sortable={true}
          filterable={true}
          exportable={true}
        />

        {/* Edit Modal */}
        {editingPerson && (
          <PersonEditModal
            person={editingPerson}
            onClose={() => setEditingPerson(null)}
            onSave={handlePersonSave}
            factions={factions}
            locations={locations}
          />
        )}
      </div>
    </div>
  )
}
