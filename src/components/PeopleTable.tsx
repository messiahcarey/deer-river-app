'use client'

import { useState } from 'react'

interface Person {
  id: string
  name: string
  species: string
  age: number | null
  occupation: string | null
  notes: string | null
  tags: string
  householdId?: string | null
  household: {
    id: string
    name: string | null
  } | null
  livesAt: {
    id: string
    name: string
  } | null
  worksAt: {
    id: string
    name: string
  } | null
  memberships?: Array<{
    id: string
    faction: {
      id: string
      name: string
      color: string | null
    }
    role: string
    isPrimary: boolean
  }>
}

interface PeopleTableProps {
  people: Person[]
  selectedPeople: string[]
  onPersonSelect: (personId: string, event: React.ChangeEvent<HTMLInputElement>) => void
  onEditPerson: (person: Person) => void
  getSortIcon: (field: string) => React.JSX.Element
  handleSort: (field: string) => void
}

export default function PeopleTable({
  people,
  selectedPeople,
  onPersonSelect,
  onEditPerson,
  getSortIcon,
  handleSort
}: PeopleTableProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useState(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  })

  if (isMobile) {
    // Mobile card layout
    return (
      <div className="space-y-4">
        {people.map((person) => (
          <div key={person.id} className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(person.id)}
                  onChange={(e) => onPersonSelect(person.id, e)}
                  className="rounded mr-3"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{person.name}</h3>
                  <p className="text-sm text-gray-600">{person.species} • {person.age || 'Unknown'} years</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditPerson(person)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Occupation:</span>
                <p className="text-gray-600">{person.occupation || 'None'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  person.tags === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : person.tags === 'absent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {person.tags}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Lives At:</span>
                <p className="text-gray-600">{person.livesAt?.name || 'None'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Works At:</span>
                <p className="text-gray-600">{person.worksAt?.name || 'None'}</p>
              </div>
            </div>

            {person.memberships && person.memberships.length > 0 && (
              <div className="mt-3">
                <span className="font-medium text-gray-700 text-sm">Factions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {person.memberships.map((membership) => (
                    <span
                      key={membership.faction.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: membership.faction.color || '#6b7280' }}
                    >
                      {membership.faction.name}
                      {membership.isPrimary && ' (Primary)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {person.notes && (
              <div className="mt-3">
                <span className="font-medium text-gray-700 text-sm">Notes:</span>
                <p className="text-gray-600 text-sm mt-1">{person.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Desktop table layout
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={selectedPeople.length === people.length && people.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    people.forEach(person => onPersonSelect(person.id, e))
                  } else {
                    people.forEach(person => onPersonSelect(person.id, e))
                  }
                }}
                className="rounded"
              />
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Name {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('species')}
            >
              <div className="flex items-center gap-1">
                Species {getSortIcon('species')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('age')}
            >
              <div className="flex items-center gap-1">
                Age {getSortIcon('age')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('occupation')}
            >
              <div className="flex items-center gap-1">
                Occupation {getSortIcon('occupation')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('livesAt')}
            >
              <div className="flex items-center gap-1">
                Lives At {getSortIcon('livesAt')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('worksAt')}
            >
              <div className="flex items-center gap-1">
                Works At {getSortIcon('worksAt')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('tags')}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon('tags')}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
              onClick={() => handleSort('memberships')}
            >
              <div className="flex items-center gap-1">
                Factions {getSortIcon('memberships')}
              </div>
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {people.map((person) => (
            <tr key={person.id} className={`hover:bg-gray-50 ${selectedPeople.includes(person.id) ? 'bg-blue-50' : ''}`}>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={selectedPeople.includes(person.id)}
                  onChange={(e) => onPersonSelect(person.id, e)}
                  className="rounded"
                />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {person.name}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {person.species}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {person.age || 'Unknown'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {person.occupation || 'None'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {person.livesAt?.name || 'None'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {person.worksAt?.name || 'None'}
              </td>
              <td className="px-4 py-3 text-gray-700">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  person.tags === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : person.tags === 'absent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {person.tags}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-700">
                <div className="flex flex-wrap gap-1">
                  {person.memberships && person.memberships.map((membership) => (
                    <span
                      key={membership.faction.id}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: membership.faction.color || '#6b7280' }}
                    >
                      {membership.faction.name}
                      {membership.isPrimary && ' (P)'}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEditPerson(person)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
