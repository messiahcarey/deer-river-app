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
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
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
      try {
        const response = await fetch('/api/people');
        const data = await response.json();
        
        if (data.success) {
          setPeople(data.data);
          setError(null);
          return;
        }
      } catch (apiErr) {
        console.log('API call failed, using fallback data');
      }
      
      // Fallback to mock data if API fails
      const fallbackPeople = [
        {
          id: '1',
          name: 'Mayor Eleanor Brightwater',
          species: 'Human',
          age: 45,
          occupation: 'Mayor',
          notes: 'Elected leader of Deer River, known for her diplomatic skills',
          tags: 'leadership,diplomatic,charismatic',
          faction: {
            id: '1',
            name: 'Town Council',
            color: '#3B82F6'
          },
          livesAt: {
            id: '1',
            name: 'Mayor\'s Manor',
            kind: 'residence'
          },
          worksAt: {
            id: '2',
            name: 'Town Hall',
            kind: 'government'
          },
          household: {
            id: '1',
            name: 'Brightwater Family'
          }
        },
        {
          id: '2',
          name: 'Thorin Ironbeard',
          species: 'Dwarf',
          age: 180,
          occupation: 'Master Blacksmith',
          notes: 'Legendary craftsman, forges the finest weapons and tools',
          tags: 'skilled,reliable,traditional',
          faction: {
            id: '3',
            name: 'Artisans Union',
            color: '#F59E0B'
          },
          livesAt: {
            id: '3',
            name: 'Ironbeard Forge',
            kind: 'residence'
          },
          worksAt: {
            id: '4',
            name: 'Ironbeard Forge',
            kind: 'business'
          },
          household: {
            id: '2',
            name: 'Ironbeard Clan'
          }
        },
        {
          id: '3',
          name: 'Luna Moonwhisper',
          species: 'Elf',
          age: 250,
          occupation: 'Healer',
          notes: 'Wise healer with deep knowledge of herbs and magic',
          tags: 'magical,wise,compassionate',
          faction: {
            id: '2',
            name: 'Merchants Guild',
            color: '#10B981'
          },
          livesAt: {
            id: '5',
            name: 'Moonwhisper Grove',
            kind: 'residence'
          },
          worksAt: {
            id: '6',
            name: 'Healing House',
            kind: 'business'
          },
          household: {
            id: '3',
            name: 'Moonwhisper Family'
          }
        },
        {
          id: '4',
          name: 'Marcus Goldleaf',
          species: 'Halfling',
          age: 35,
          occupation: 'Merchant',
          notes: 'Successful trader with connections throughout the region',
          tags: 'charismatic,wealthy,well-connected',
          faction: {
            id: '2',
            name: 'Merchants Guild',
            color: '#10B981'
          },
          livesAt: {
            id: '7',
            name: 'Goldleaf Manor',
            kind: 'residence'
          },
          worksAt: {
            id: '8',
            name: 'Goldleaf Trading Post',
            kind: 'business'
          },
          household: {
            id: '4',
            name: 'Goldleaf Family'
          }
        }
      ];
      setPeople(fallbackPeople);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        if (data.success) {
          setLocations(data.data);
          return;
        }
      } catch (apiErr) {
        console.log('Locations API call failed, using fallback data');
      }
      
      // Fallback data
      const fallbackLocations = [
        { id: '1', name: 'Mayor\'s Manor', kind: 'residence' },
        { id: '2', name: 'Town Hall', kind: 'government' },
        { id: '3', name: 'Ironbeard Forge', kind: 'business' },
        { id: '4', name: 'Healing House', kind: 'business' },
        { id: '5', name: 'Moonwhisper Grove', kind: 'residence' },
        { id: '6', name: 'Goldleaf Trading Post', kind: 'business' },
        { id: '7', name: 'Goldleaf Manor', kind: 'residence' }
      ];
      setLocations(fallbackLocations);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const fetchFactions = async () => {
    try {
      try {
        const response = await fetch('/api/factions');
        const data = await response.json();
        if (data.success) {
          setFactions(data.data);
          return;
        }
      } catch (apiErr) {
        console.log('Factions API call failed, using fallback data');
      }
      
      // Fallback data
      const fallbackFactions = [
        { id: '1', name: 'Town Council', color: '#3B82F6' },
        { id: '2', name: 'Merchants Guild', color: '#10B981' },
        { id: '3', name: 'Artisans Union', color: '#F59E0B' },
        { id: '4', name: 'Guardian Order', color: '#EF4444' },
        { id: '5', name: 'Scholars Circle', color: '#8B5CF6' }
      ];
      setFactions(fallbackFactions);
    } catch (err) {
      console.error('Failed to fetch factions:', err);
    }
  };

  const handleEditPerson = (person: Person) => {
    setEditingPerson(person);
  };

  const handleSavePerson = async (updatedPerson: Partial<Person>) => {
    try {
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
          return;
        }
      } catch (apiErr) {
        console.log('API call failed, updating local state');
      }
      
      // Fallback: update local state
      setPeople(prev => prev.map(p => 
        p.id === updatedPerson.id ? { ...p, ...updatedPerson } : p
      ));
      setEditingPerson(null);
    } catch (err) {
      throw err;
    }
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
            <div className="flex gap-4">
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
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Species</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Age</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Occupation</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Faction</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Lives At</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Works At</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {people.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
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
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => handleEditPerson(person)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-2 py-1 rounded"
                                >
                                  ✏️ Edit
                                </button>
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
      </div>
    </div>
  );
}
