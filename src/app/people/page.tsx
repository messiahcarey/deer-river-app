'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import PersonEditModal from "@/components/PersonEditModal";
import PeopleTable from "@/components/PeopleTable";
import BulkOperations from "@/components/BulkOperations";
// import { usePersonValidation } from "@/hooks/useDataValidation";
// import { validatePeopleListResponse } from "@/utils/apiValidation";
// import { logDataConsistency } from "@/utils/dataConsistency";
// import { useAutoRefresh } from "@/hooks/useAutoRefresh";

interface Person {
  id: string;
  name: string;
  species: string;
  age: number | null;
  occupation: string | null;
  notes: string | null;
  tags: string;
  livesAt: {
    id: string;
    name: string;
  } | null;
  worksAt: {
    id: string;
    name: string;
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
  const [editingPersonIndex, setEditingPersonIndex] = useState<number | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [showFactionModal, setShowFactionModal] = useState(false);
  const [sortField, setSortField] = useState<keyof Person | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [locations, setLocations] = useState<Array<{id: string; name: string; kind: string}>>([]);
  const [factions, setFactions] = useState<Array<{id: string; name: string; color: string | null}>>([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    species: [] as string[],
    occupation: [] as string[],
    tags: [] as string[],
    livesAt: [] as string[],
    worksAt: [] as string[],
    faction: [] as string[]
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPeople();
    fetchLocations();
    fetchFactions();
  }, []);

  // TODO: Add auto-refresh back after fixing circular dependency
  // useAutoRefresh({
  //   refreshFunction: fetchPeople,
  //   onError: (error) => {
  //     console.error('Auto-refresh failed:', error);
  //     setError('Failed to refresh data automatically');
  //   }
  // });

  // Extract unique values for filter options
  const getUniqueSpecies = () => {
    const species = [...new Set(people?.map(person => person.species) || [])].filter(Boolean).sort();
    return species;
  };

  const getUniqueOccupations = () => {
    const occupations = [...new Set(people?.map(person => person.occupation) || [])].filter((occ): occ is string => Boolean(occ)).sort();
    return occupations;
  };

  const getUniqueTags = () => {
    const tags = [...new Set(people?.map(person => person.tags) || [])].filter(Boolean).sort();
    return tags;
  };

  const getUniqueLocations = () => {
    const locations = [...new Set([
      ...(people?.map(person => person.livesAt?.name) || []).filter((name): name is string => Boolean(name)),
      ...(people?.map(person => person.worksAt?.name) || []).filter((name): name is string => Boolean(name))
    ])].sort();
    return locations;
  };

  const getUniqueFactions = () => {
    const factionNames = [...new Set(
      people?.flatMap(person => 
        person.memberships?.map(membership => membership.faction.name) || []
      ) || []
    )].sort();
    return factionNames;
  };

  // Check if people have no faction or no workplace
  const hasPeopleWithNoFaction = () => {
    return people.some(person => !person.memberships || person.memberships.length === 0);
  };

  const hasPeopleWithNoWorkplace = () => {
    return people.some(person => !person.worksAt);
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/people');
      const data = await response.json();
      
      if (data.success) {
        console.log('People data received:', data.data);
        console.log('First person livesAt:', data.data[0]?.livesAt);
        console.log('First person age:', data.data[0]?.age);
        console.log('First person memberships:', data.data[0]?.memberships);
        
        // TODO: Add validation back after fixing circular dependency
        // const validation = validatePeopleListResponse(data);
        // if (!validation.isValid) {
        //   console.warn('API response validation failed:', validation.errors);
        //   setError(`Data validation failed: ${validation.errors.join(', ')}`);
        //   return;
        // }
        
        // TODO: Add data consistency check back after fixing circular dependency
        // logDataConsistency(data.data);
        
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
    const sortedPeople = getFilteredAndSortedPeople();
    const index = sortedPeople.findIndex(p => p.id === person.id);
    setEditingPerson(person);
    setEditingPersonIndex(index);
  };

  const handleNavigateToPerson = (index: number) => {
    const sortedPeople = getFilteredAndSortedPeople();
    if (index >= 0 && index < sortedPeople.length) {
      setEditingPerson(sortedPeople[index]);
      setEditingPersonIndex(index);
    }
  };

  const handleSavePerson = async (updatedPerson: Partial<Person>) => {
    try {
      if (updatedPerson.id) {
        // Update existing person
        const response = await fetch(`/api/people/${updatedPerson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPerson),
        });

        const data = await response.json();
        console.log('Update response:', data);
        if (data.success) {
          console.log('Update successful, refreshing people data...');
          await fetchPeople(); // Refresh the list
          setEditingPerson(null);
        } else {
          throw new Error(data.error || 'Failed to update person');
        }
      } else {
        // Create new person
        const response = await fetch('/api/people', {
          method: 'POST',
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
          throw new Error(data.error || 'Failed to create person');
        }
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
      
      const rangeIds = people?.slice(start, end + 1).map(p => p.id) || [];
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
    setSelectedPeople(people?.map(p => p.id) || []);
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

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as keyof Person);
      setSortDirection('asc');
    }
  };


  const getSortIcon = (field: string) => {
    if (sortField !== field) return <span>↕️</span>;
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  // Filter functions
  const handleFilterChange = (field: keyof typeof filters, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field: keyof typeof filters, value: string, checked: boolean) => {
    setFilters(prev => {
      const currentValues = prev[field] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      species: [],
      occupation: [],
      tags: [],
      livesAt: [],
      worksAt: [],
      faction: []
    });
  };

  const getFilteredPeople = () => {
    let filtered = people;

    // Apply filters
    if (filters.name) {
      filtered = filtered.filter(person => 
        person.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.species.length > 0) {
      filtered = filtered.filter(person => 
        filters.species.includes(person.species)
      );
    }

    if (filters.occupation.length > 0) {
      filtered = filtered.filter(person => 
        person.occupation && filters.occupation.includes(person.occupation)
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(person => 
        filters.tags.includes(person.tags)
      );
    }

    if (filters.livesAt.length > 0) {
      filtered = filtered.filter(person => 
        person.livesAt && filters.livesAt.includes(person.livesAt.name)
      );
    }

    if (filters.worksAt.length > 0) {
      filtered = filtered.filter(person => {
        if (filters.worksAt.includes('None')) {
          return !person.worksAt;
        }
        return person.worksAt && filters.worksAt.includes(person.worksAt.name);
      });
    }

    if (filters.faction.length > 0) {
      filtered = filtered.filter(person => {
        if (filters.faction.includes('None')) {
          return !person.memberships || person.memberships.length === 0;
        }
        return person.memberships?.some(membership => 
          filters.faction.includes(membership.faction.name)
        );
      });
    }

    return filtered;
  };

  const getFilteredAndSortedPeople = () => {
    const filtered = getFilteredPeople();
    if (!sortField) return filtered;

    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle nested objects (livesAt, worksAt)
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

      // Handle numeric fields specially
      if (sortField === 'age') {
        const aNum = typeof aValue === 'number' ? aValue : (aValue === '' || aValue === null || aValue === undefined) ? -1 : Number(aValue);
        const bNum = typeof bValue === 'number' ? bValue : (bValue === '' || bValue === null || bValue === undefined) ? -1 : Number(bValue);
        
        // Handle NaN values (treat as -1 for sorting)
        const aAge = isNaN(aNum) ? -1 : aNum;
        const bAge = isNaN(bNum) ? -1 : bNum;
        
        if (aAge < bAge) return sortDirection === 'asc' ? -1 : 1;
        if (aAge > bAge) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      // Convert to strings for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            👥 People of Deer River
          </h1>
          <p className="text-lg text-amber-700">
            Manage the citizens of Deer River. View their details, relationships, and opinions.
          </p>
        </header>

        {/* Bulk Operations */}
        <BulkOperations
          selectedPeople={selectedPeople}
          people={people}
          onBulkAssignHousing={async (personIds, locationId) => {
            // Implement bulk housing assignment
            for (const personId of personIds) {
              const response = await fetch(`/api/people/${personId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ livesAtId: locationId })
              })
              if (!response.ok) {
                console.error(`Failed to update person ${personId}`)
              }
            }
            await fetchPeople()
            setSelectedPeople([])
            alert(`Assigned ${personIds.length} people to housing`)
          }}
          onBulkAssignFaction={async (personIds, factionId) => {
            // Implement bulk faction assignment
            for (const personId of personIds) {
              const response = await fetch(`/api/people/${personId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ factionIds: [factionId] })
              })
              if (!response.ok) {
                console.error(`Failed to update person ${personId}`)
              }
            }
            await fetchPeople()
            setSelectedPeople([])
            alert(`Assigned ${personIds.length} people to faction`)
          }}
          onBulkUpdateStatus={async (personIds, status) => {
            // Implement bulk status update
            for (const personId of personIds) {
              const response = await fetch(`/api/people/${personId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: status })
              })
              if (!response.ok) {
                console.error(`Failed to update person ${personId}`)
              }
            }
            await fetchPeople()
            setSelectedPeople([])
            alert(`Updated status for ${personIds.length} people`)
          }}
          onBulkDelete={async (personIds) => {
            // Implement bulk delete
            let successCount = 0
            let failedCount = 0

            for (const personId of personIds) {
              try {
                const response = await fetch(`/api/people/${personId}`, {
                  method: 'DELETE'
                })
                const data = await response.json()
                
                if (response.ok && data.success) {
                  successCount++
                } else {
                  failedCount++
                  console.error(`Failed to delete person ${personId}:`, data.error)
                }
              } catch (error) {
                failedCount++
                console.error(`Error deleting person ${personId}:`, error)
              }
            }
            
            await fetchPeople()
            setSelectedPeople([])
            
            if (failedCount > 0) {
              alert(`Delete completed!\n✅ Successful: ${successCount}\n❌ Failed: ${failedCount}`)
            } else {
              alert(`Successfully deleted ${successCount} people`)
            }
          }}
          locations={locations}
          factions={factions}
        />

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">🔍 Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                  placeholder="Filter by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
              {getUniqueSpecies().map(species => (
                <label key={species} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.species.includes(species)}
                    onChange={(e) => handleMultiSelectChange('species', species, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{species}</span>
                </label>
              ))}
            </div>
          </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {getUniqueOccupations().map(occupation => (
                    <label key={occupation} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.occupation.includes(occupation)}
                        onChange={(e) => handleMultiSelectChange('occupation', occupation, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{occupation}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {getUniqueTags().map(tag => (
                    <label key={tag} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={(e) => handleMultiSelectChange('tags', tag, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lives At</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {getUniqueLocations().map(location => (
                    <label key={location} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.livesAt.includes(location)}
                        onChange={(e) => handleMultiSelectChange('livesAt', location, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Works At</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {hasPeopleWithNoWorkplace() && (
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.worksAt.includes('None')}
                        onChange={(e) => handleMultiSelectChange('worksAt', 'None', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">None (No workplace)</span>
                    </label>
                  )}
                  {getUniqueLocations().map(location => (
                    <label key={location} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.worksAt.includes(location)}
                        onChange={(e) => handleMultiSelectChange('worksAt', location, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Faction</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                  {hasPeopleWithNoFaction() && (
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.faction.includes('None')}
                        onChange={(e) => handleMultiSelectChange('faction', 'None', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700 font-medium">None (No faction)</span>
                    </label>
                  )}
                  {getUniqueFactions().map(faction => (
                    <label key={faction} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.faction.includes(faction)}
                        onChange={(e) => handleMultiSelectChange('faction', faction, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{faction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Residents ({getFilteredAndSortedPeople().length} of {people.length})
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
              <button
                onClick={() => setEditingPerson({} as Person)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ➕ New Person
              </button>
              <Link 
                href="/import" 
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
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
            <PeopleTable
              people={getFilteredAndSortedPeople()}
              selectedPeople={selectedPeople}
              onPersonSelect={handlePersonSelect}
              onEditPerson={handleEditPerson}
              getSortIcon={getSortIcon}
              handleSort={handleSort}
            />
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
                  {new Set(people?.map(p => p.species) || []).size}
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
            onClose={() => {
              setEditingPerson(null);
              setEditingPersonIndex(null);
            }}
            onSave={handleSavePerson}
            allPeople={getFilteredAndSortedPeople()}
            currentIndex={editingPersonIndex ?? undefined}
            onNavigate={handleNavigateToPerson}
            onLocationCreated={fetchLocations}
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
                      ?.filter(p => selectedPeople.includes(p.id))
                      ?.map(p => p.name)
                      ?.join(', ') || ''}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Faction</label>
                  <select
                    id="faction-select"
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Choose a faction...</option>
                    {factions?.map(faction => (
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
