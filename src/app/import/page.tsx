'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface CSVRow {
  name: string
  species: string
  age: string
  occupation: string
  notes: string
  tags: string
  livesAtId: string
  worksAtId: string
  householdId: string
  factionIds: string
}

interface ImportResult {
  success: boolean
  message: string
  importedCount: number
  errorCount: number
  errors: Array<{ name: string; error: string }>
  locations: number
  factions: number
  timestamp: string
  importedPeople?: Array<{
    id: string
    name: string
    species: string
    age: number | null
    occupation: string | null
    tags: string
    livesAtId: string | null
    worksAtId: string | null
    householdId: string | null
    factionIds: string[]
  }>
}

export default function ImportPage() {
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showPostImportEdit, setShowPostImportEdit] = useState(false)
  const [factions, setFactions] = useState<Array<{id: string, name: string, color: string}>>([])
  const [locations, setLocations] = useState<Array<{id: string, name: string, type: string}>>([])
  const [editingPerson, setEditingPerson] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch factions and locations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [factionsRes, locationsRes] = await Promise.all([
          fetch('/api/factions'),
          fetch('/api/locations')
        ])
        
        if (factionsRes.ok) {
          const factionsData = await factionsRes.json()
          setFactions(factionsData.data || [])
        }
        
        if (locationsRes.ok) {
          const locationsData = await locationsRes.json()
          setLocations(locationsData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch factions and locations:', error)
      }
    }
    
    fetchData()
  }, [])

  const updatePersonData = async (personId: string, updates: {
    factionIds?: string[]
    livesAtId?: string
    worksAtId?: string
  }) => {
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Person updated:', result)
        return true
      } else {
        console.error('Failed to update person:', await response.text())
        return false
      }
    } catch (error) {
      console.error('Error updating person:', error)
      return false
    }
  }

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const data = lines.slice(1).map(line => {
      const values: string[] = []
      let inQuote = false
      let currentVal = ''
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuote = !inQuote
          if (!inQuote && line[i + 1] === ',') { // End of quoted field
            values.push(currentVal.trim())
            currentVal = ''
            i++ // Skip comma
          }
        } else if (char === ',' && !inQuote) {
          values.push(currentVal.trim())
          currentVal = ''
        } else {
          currentVal += char
        }
      }
      values.push(currentVal.trim()) // Push the last value
      
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      
      // Convert to CSVRow interface
      return {
        name: obj.name || '',
        species: obj.species || '',
        age: obj.age || '',
        occupation: obj.occupation || '',
        notes: obj.notes || '',
        tags: obj.tags || 'present',
        livesAtId: obj.livesAtId || '',
        worksAtId: obj.worksAtId || '',
        householdId: obj.householdId || '',
        factionIds: obj.factionIds || ''
      }
    })
    return data
  }

  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      const parsedData = parseCSV(csvText)
      setCsvData(parsedData)
      setImportResult(null)
    }
    reader.readAsText(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (csvData.length === 0) {
      alert('Please upload a CSV file first')
      return
    }

    setIsUploading(true)
    setImportResult(null)

    try {
      // Convert CSV data back to a file for upload
      const csvText = [
        'name,species,age,occupation,notes,tags,livesAtId,worksAtId,householdId,factionIds',
        ...csvData.map(row => 
          `${row.name},${row.species},${row.age},${row.occupation},"${row.notes}",${row.tags},${row.livesAtId},${row.worksAtId},${row.householdId},${row.factionIds}`
        )
      ].join('\n')

      const blob = new Blob([csvText], { type: 'text/csv' })
      const file = new File([blob], 'residents.csv', { type: 'text/csv' })

      const formData = new FormData()
      formData.append('csvFile', file)

      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      setImportResult(result)
      
      // Show post-import edit option if people were imported
      if (result.success && result.importedCount > 0) {
        setShowPostImportEdit(true)
      }
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        message: 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        importedCount: 0,
        errorCount: 0,
        errors: [],
        locations: 0,
        factions: 0,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsUploading(false)
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `name,species,age,occupation,notes,tags,livesAtId,worksAtId,householdId,factionIds
Rurik Copperpot,Human,58,Innkeeper,"Boisterous; stout, large nose; pragmatic about adventurers.",present,,,,
Oswin Finch,Human,8,Blacksmith,"Wispy grey beard, missing left ear; serious, grim worker.",present,,,,
Torrin,Human,44,Shopkeeper,"Gruff, impatient, protective; tolerates adventurers for coin.",present,,,,`
    
    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'deer-river-residents-sample.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link href="/" className="text-amber-600 hover:text-amber-800 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            📊 CSV Import
          </h1>
          <p className="text-lg text-amber-700">
            Import resident data from CSV files to populate Deer River&apos;s database.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Upload CSV File
            </h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-amber-400 bg-amber-50' 
                  : 'border-gray-300 hover:border-amber-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-4xl mb-4">📁</div>
              <p className="text-gray-600 mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={downloadSampleCSV}
                className="text-amber-600 hover:text-amber-800 text-sm underline"
              >
                Download Sample CSV
              </button>
            </div>

            {csvData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Preview ({csvData.length} residents)
                </h3>
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Species</th>
                        <th className="px-3 py-2 text-left">Age</th>
                        <th className="px-3 py-2 text-left">Occupation</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.species}</td>
                          <td className="px-3 py-2">{row.age}</td>
                          <td className="px-3 py-2 truncate max-w-32" title={row.occupation}>
                            {row.occupation}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              row.tags === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {row.tags}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 10 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      ... and {csvData.length - 10} more residents
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Import Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Import to Database
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">CSV Format Requirements</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Name:</strong> Resident&apos;s full name</li>
                  <li>• <strong>Race:</strong> Species (Human, Elf, Dwarf, etc.)</li>
                  <li>• <strong>Age:</strong> Numeric age (optional)</li>
                  <li>• <strong>Occupation:</strong> Job or role</li>
                  <li>• <strong>Presence:</strong> Present or Absent</li>
                  <li>• <strong>Notes:</strong> Additional details</li>
                </ul>
              </div>

              <button
                onClick={handleImport}
                disabled={csvData.length === 0 || isUploading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  csvData.length === 0 || isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isUploading ? 'Importing...' : `Import ${csvData.length} Residents`}
              </button>

              {importResult && (
                <div className={`p-4 rounded-lg ${
                  importResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    importResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                  </h3>
                  <p className={`text-sm mb-2 ${
                    importResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {importResult.message}
                  </p>
                  
                  {importResult.success && (
                    <div className="text-sm text-green-700 space-y-1">
                      <p>• Imported: {importResult.importedCount} residents</p>
                      <p>• Created: {importResult.locations} locations</p>
                      <p>• Created: {importResult.factions} factions</p>
                      {importResult.errorCount > 0 && (
                        <p>• Errors: {importResult.errorCount} residents</p>
                      )}
                    </div>
                  )}

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-red-800 mb-2">Errors:</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <div key={index} className="text-xs text-red-700 mb-1">
                            <strong>{error.name}:</strong> {error.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post-Import Editing Section */}
        {showPostImportEdit && importResult?.importedPeople && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ✏️ Post-Import Editing
            </h2>
            <p className="text-gray-600 mb-6">
              Review and adjust faction memberships, living locations, and work assignments for imported residents.
            </p>

            <div className="space-y-4">
              {importResult.importedPeople.map((person, index) => (
                <div key={person.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{person.name}</h3>
                      <p className="text-sm text-gray-600">
                        {person.species} • Age: {person.age || 'Unknown'} • {person.occupation || 'No occupation'}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingPerson(editingPerson === index ? null : index)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      {editingPerson === index ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editingPerson === index && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {/* Faction Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Factions
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {factions.map(faction => (
                            <label key={faction.id} className="flex items-center">
                              <input
                                type="checkbox"
                                defaultChecked={person.factionIds.includes(faction.id)}
                                className="mr-2"
                                onChange={(e) => {
                                  // Handle faction selection
                                  console.log('Faction selection changed:', faction.name, e.target.checked)
                                }}
                              />
                              <span className="text-sm" style={{ color: faction.color }}>
                                {faction.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Living Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lives At
                        </label>
                        <select 
                          className="w-full p-2 border rounded"
                          defaultValue={person.livesAtId || ''}
                          onChange={(e) => {
                            console.log('Living location changed:', e.target.value)
                          }}
                        >
                          <option value="">Select location...</option>
                          {locations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name} ({location.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Work Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Works At
                        </label>
                        <select 
                          className="w-full p-2 border rounded"
                          defaultValue={person.worksAtId || ''}
                          onChange={(e) => {
                            console.log('Work location changed:', e.target.value)
                          }}
                        >
                          <option value="">Select location...</option>
                          {locations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name} ({location.type})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  // Save all changes
                  console.log('Saving all changes...')
                  setShowPostImportEdit(false)
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save All Changes
              </button>
              <button
                onClick={() => setShowPostImportEdit(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Skip Editing
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How to Use CSV Import
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <h3 className="font-semibold text-gray-800 mb-2">Prepare Your Data</h3>
              <p className="text-sm text-gray-600">
                Create a CSV file with the required columns: Name, Race, Age, Occupation, Presence, and Notes.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <h3 className="font-semibold text-gray-800 mb-2">Upload & Preview</h3>
              <p className="text-sm text-gray-600">
                Upload your CSV file and review the data preview to ensure everything looks correct.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <h3 className="font-semibold text-gray-800 mb-2">Import to Database</h3>
              <p className="text-sm text-gray-600">
                Click the import button to add all residents to Deer River&apos;s database.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
