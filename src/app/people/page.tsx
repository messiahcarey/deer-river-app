'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import PersonEditModal from "@/components/PersonEditModal";

interface Person {
  id: string;
  name: string;
  species: string;
  age: number | null;
  occupation: string | null;
  notes: string | null;
  tags: string;
  faction: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  livesAt: {
    id: string;
    name: string;
    kind: string;
  } | null;
  worksAt: {
    id: string;
    name: string;
    kind: string;
  } | null;
  household: {
    id: string;
    name: string | null;
  } | null;
  memberships?: {
    id: string;
    faction: {
      id: string;
      name: string;
      color: string | null;
    };
    role: string;
    isPrimary: boolean;
  }[];
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [showFactionModal, setShowFactionModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Person | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [locations, setLocations] = useState<Array<{id: string; name: string; kind: string}>>([]);
  const [factions, setFactions] = useState<Array<{id: string; name: string; color: string | null}>>([]);

  useEffect(() => {
    fetchPeople();
    fetchLocations();
    fetchFactions();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/people');
      const data = await response.json();
      
      if (data.success) {
        setPeople(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch people');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };


  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations');
      const data = await response.json();
      if (data.success) {
        setLocations(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };


  const fetchFactions = async () => {
    try {
      const response = await fetch('/api/factions');
      const data = await response.json();
      if (data.success) {
        setFactions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch factions:', err);
    }
  };


  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
  };

  const handleSavePerson = async (updatedPerson: Partial<Person>) => {
    try {
      const response = await fetch(`/api/people/${updatedPerson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPerson),
      });

      const data = await response.json();
      if (data.success) {
        await fetchPeople(); // Refresh the list
        setEditingPerson(null);
      } else {
        throw new Error(data.error || 'Failed to update person');
      }
    } catch (err) {
      throw err;
    }
  };

  const handlePersonSelect = (personId: string, event?: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.nativeEvent instanceof MouseEvent && event.nativeEvent.shiftKey && selectedPeople.length > 0) {
      // Shift-click: select range from last selected to current
      const currentIndex = people.findIndex(p => p.id === personId);
      const lastSelectedIndex = people.findIndex(p => p.id === selectedPeople[selectedPeople.length - 1]);
      
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      
      const rangeIds = people.slice(start, end + 1).map(p => p.id);
      setSelectedPeople(prev => {
        const newSelection = new Set([...prev, ...rangeIds]);
        return Array.from(newSelection);
      });
    } else {
      // Normal click: toggle single selection
      setSelectedPeople(prev => 
        prev.includes(personId) 
          ? prev.filter(id => id !== personId)
          : [...prev, personId]
      );
    }
  };

  const handleSelectAll = () => {
    setSelectedPeople(people.map(p => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPeople([]);
  };

  const handleBulkFactionChange = () => {
    if (selectedPeople.length === 0) {
      alert('Please select at least one person');
      return;
    }
    setShowFactionModal(true);
  };

  const handleFactionAssignment = async (factionId: string) => {
    if (!factionId || selectedPeople.length === 0) return;

    try {
      let successCount = 0;
      let failedCount = 0;

      for (const personId of selectedPeople) {
        try {
          // First, remove all existing memberships for this person
          const membershipsResponse = await fetch(`/api/memberships?personId=${personId}`);
          const membershipsData = await membershipsResponse.json();
          
          if (membershipsData.ok && membershipsData.data) {
            // Remove all existing memberships
            for (const membership of membershipsData.data) {
              await fetch(`/api/memberships/${membership.id}`, {
                method: 'DELETE',
              });
            }
          }

          // Then assign the new faction
          const response = await fetch('/api/memberships', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              personId,
              factionId,
              role: 'member',
              isPrimary: true,
              alignment: 75,
              openness: 60,
              notes: 'Bulk assigned via UI'
            })
          });

          const data = await response.json();
          if (data.ok) {
            successCount++;
          } else {
            failedCount++;
            console.error(`Failed to assign ${personId}:`, data.error);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error assigning ${personId}:`, error);
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      alert(`Faction assignment complete!\n✅ Successful: ${successCount}\n❌ Failed: ${failedCount}`);
      
      // Refresh data and close modal
      await fetchPeople();
      setShowFactionModal(false);
      setSelectedPeople([]);
    } catch (error) {
      console.error('Error in bulk faction assignment:', error);
      alert('Failed to assign factions. Please try again.');
    }
  };

  const handleSort = (field: keyof Person) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedPeople = () => {
    if (!sortField) return people;

    return [...people].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle nested objects (faction, livesAt, worksAt)
      if (sortField === 'faction' && typeof aValue === 'object' && aValue !== null) {
        aValue = (aValue as { name?: string }).name || '';
      }
      if (sortField === 'faction' && typeof bValue === 'object' && bValue !== null) {
        bValue = (bValue as { name?: string }).name || '';
      }
      if (sortField === 'livesAt' && typeof aValue === 'object' && aValue !== null) {
        aValue = (aValue as { name?: string }).name || '';
      }
      if (sortField === 'livesAt' && typeof bValue === 'object' && bValue !== null) {
        bValue = (bValue as { name?: string }).name || '';
      }
      if (sortField === 'worksAt' && typeof aValue === 'object' && aValue !== null) {
        aValue = (aValue as { name?: string }).name || '';
      }
      if (sortField === 'worksAt' && typeof bValue === 'object' && bValue !== null) {
        bValue = (bValue as { name?: string }).name || '';
      }
      
      // Handle memberships array (sort by primary faction name)
      if (sortField === 'memberships' && Array.isArray(aValue)) {
        const primaryMembership = aValue.find((m: { isPrimary: boolean; faction: { name: string } }) => m.isPrimary);
        aValue = primaryMembership ? primaryMembership.faction.name : (aValue.length > 0 ? (aValue[0] as { faction: { name: string } }).faction.name : '');
      }
      if (sortField === 'memberships' && Array.isArray(bValue)) {
        const primaryMembership = bValue.find((m: { isPrimary: boolean; faction: { name: string } }) => m.isPrimary);
        bValue = primaryMembership ? primaryMembership.faction.name : (bValue.length > 0 ? (bValue[0] as { faction: { name: string } }).faction.name : '');
      }
      
      // Handle tags field (convert to display text)
      if (sortField === 'tags') {
        aValue = aValue === 'present' ? 'Present' : 'Absent';
        bValue = bValue === 'present' ? 'Present' : 'Absent';
      }

      // Convert to strings for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (field: keyof Person) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            👥 People of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Manage the citizens of Deer River. View their details, relationships, and opinions.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Residents ({people.length})
            </h2>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm"
                >
                  Deselect All
                </button>
              </div>
              
              {selectedPeople.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedPeople.length} selected
                  </span>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value === 'change-faction') {
                          handleBulkFactionChange();
                          e.target.value = '';
                        }
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm appearance-none pr-8"
                    >
                      <option value="">Actions...</option>
                      <option value="change-faction">Change Faction</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                onClick={fetchPeople}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🔄 Refresh
              </button>
              <Link 
                href="/import" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📊 Import CSV
              </Link>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading residents...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {!loading && !error && people.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                No Residents Found
              </h3>
              <p className="text-gray-600 mb-6">
                Import some residents using the CSV import feature to get started.
              </p>
              <Link 
                href="/import" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                📊 Import CSV Data
              </Link>
            </div>
          )}

          {!loading && !error && people.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-12">
                      <input
                        type="checkbox"
                        checked={selectedPeople.length === people.length && people.length > 0}
                        onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
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
                        Faction {getSortIcon('memberships')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getSortedPeople().map((person) => (
                    <tr key={person.id} className={`hover:bg-gray-50 ${selectedPeople.includes(person.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPeople.includes(person.id)}
                          onChange={(e) => handlePersonSelect(person.id, e)}
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
                      <td className="px-4 py-3">
                        {person.faction ? (
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: person.faction.color ? `${person.faction.color}20` : '#f3f4f6',
                              color: person.faction.color || '#374151'
                            }}
                          >
                            {person.faction.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {person.livesAt?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {person.worksAt?.name || 'None'}
                      </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  person.tags === 'present' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {person.tags === 'present' ? 'Present' : 'Absent'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {person.memberships && person.memberships.length > 0 ? (
                                  <div className="space-y-1">
                                    {person.memberships.map((membership) => (
                                      <div key={membership.id} className="flex items-center gap-2">
                                        <span 
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: membership.faction.color || '#6b7280' }}
                                        ></span>
                                        <span className="text-sm">
                                          {membership.faction.name}
                                          {membership.isPrimary && (
                                            <span className="ml-1 text-xs text-gray-500">(Primary)</span>
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">No faction</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center space-x-2">
                                  <button
                                    onClick={() => handleEditPerson(person)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-2 py-1 rounded"
                                  >
                                    ✏️ Edit
                                  </button>
                                </div>
                              </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && !error && people.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{people.length}</div>
                <div className="text-sm text-blue-700">Total Residents</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {people.filter(p => p.tags === 'present').length}
                </div>
                <div className="text-sm text-green-700">Present</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {people.filter(p => p.tags === 'absent').length}
                </div>
                <div className="text-sm text-red-700">Absent</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(people.map(p => p.species)).size}
                </div>
                <div className="text-sm text-purple-700">Species</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Person Modal */}
        {editingPerson && (
          <PersonEditModal
            person={editingPerson}
            locations={locations}
            factions={factions}
            onClose={() => setEditingPerson(null)}
            onSave={handleSavePerson}
          />
        )}


        {/* Faction Selection Modal */}
        {showFactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Change Faction
                  </h2>
                  <button
                    onClick={() => setShowFactionModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    Assigning {selectedPeople.length} selected people to a faction:
                  </p>
                  <div className="text-sm text-gray-500 mb-4 max-h-32 overflow-y-auto">
                    {people
                      .filter(p => selectedPeople.includes(p.id))
                      .map(p => p.name)
                      .join(', ')}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Faction</label>
                  <select
                    id="faction-select"
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

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowFactionModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const select = document.getElementById('faction-select') as HTMLSelectElement;
                      if (select.value) {
                        handleFactionAssignment(select.value);
                      } else {
                        alert('Please select a faction');
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Assign Faction
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
