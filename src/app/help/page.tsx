'use client'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help & Documentation
            </h1>
            <p className="text-lg text-gray-600">
              Complete guide to using Deer River.
            </p>
          </div>

          <div className="prose max-w-none">
            <h2>Getting Started</h2>
            <p>Welcome to Deer River, your comprehensive village management system. This application helps you track residents, factions, buildings, and their relationships in your community.</p>
            
            <h3>People Management</h3>
            <p>Manage your village residents with full CRUD operations:</p>
            <ul>
              <li><strong>Adding Residents:</strong> Click "New Person" button, fill in details (name, species, age, occupation, status), assign to buildings</li>
              <li><strong>Editing Information:</strong> Click on any resident to open edit modal, update details, save changes</li>
              <li><strong>Faction Memberships:</strong> Select multiple factions in the edit modal, first selected becomes primary faction</li>
              <li><strong>Creating Homes:</strong> Use "Create Home" button to automatically create a "Private Residence" building and assign the resident</li>
              <li><strong>Bulk Operations:</strong> Select multiple residents for bulk editing or deletion</li>
              <li><strong>Filtering & Sorting:</strong> Use filters to find specific residents, sort by any column</li>
            </ul>

            <h3>Faction Management</h3>
            <p>Organize your community into political and social groups:</p>
            <ul>
              <li><strong>Creating Factions:</strong> Click "New Faction", enter name, description, motto, and color</li>
              <li><strong>Managing Members:</strong> Add/remove members through individual resident edit modals</li>
              <li><strong>Primary Factions:</strong> Set primary faction by selecting it first in a resident's faction list</li>
              <li><strong>Faction Colors:</strong> Visual identification system for easy recognition</li>
            </ul>

            <h3>Building Management</h3>
            <p>Track structures and their residents:</p>
            <ul>
              <li><strong>Adding Buildings:</strong> Click "New Building", specify name, type, capacity, description</li>
              <li><strong>Capacity Management:</strong> Set how many people each building can hold</li>
              <li><strong>Resident Assignment:</strong> Assign residents to buildings through the People page</li>
              <li><strong>Building Types:</strong> Residential, Commercial, and other building categories</li>
              <li><strong>Deleting Buildings:</strong> Remove buildings when no longer needed</li>
            </ul>

            <h3>Interactive Map</h3>
            <p>Visualize your village layout:</p>
            <ul>
              <li><strong>Canvas-based Visualization:</strong> Interactive map showing building locations</li>
              <li><strong>Building Placement:</strong> Add and position buildings on the map</li>
              <li><strong>Spatial Organization:</strong> Understand your community's layout and relationships</li>
            </ul>

            <h3>Analytics & Demographics</h3>
            <p>Understand your community through data visualization:</p>
            <ul>
              <li><strong>Population Overview:</strong> Total residents, species distribution, age demographics</li>
              <li><strong>Age Distribution:</strong> Population breakdown by D&D age categories</li>
              <li><strong>Species Analysis:</strong> Detailed demographic breakdown by race/species</li>
              <li><strong>Faction Distribution:</strong> Political and social group analysis</li>
              <li><strong>Interactive Charts:</strong> Population pyramids, pie charts, bar charts</li>
              <li><strong>Location Analysis:</strong> Where different species and factions live</li>
            </ul>

            <h3>Key Features</h3>
            <ul>
              <li><strong>Multi-select Filters:</strong> Filter people by multiple criteria simultaneously</li>
              <li><strong>Auto-save:</strong> Changes are automatically saved as you cycle through residents</li>
              <li><strong>Next Person Button:</strong> Quickly cycle through residents for bulk editing</li>
              <li><strong>Status Color Coding:</strong> Visual indicators for resident status (present/absent)</li>
              <li><strong>Comprehensive Search:</strong> Find residents by name, species, faction, or other criteria</li>
            </ul>

            <h3>Troubleshooting</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Changes Not Saving</h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Make sure you clicked "Save Changes"</li>
                <li>Check for error messages in the browser console (F12)</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Performance Tips</h4>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                <li>Use filters to find specific residents quickly</li>
                <li>Bulk operations for multiple changes</li>
                <li>Regular data cleanup to maintain performance</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Best Practices</h4>
              <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                <li>Keep resident information up to date</li>
                <li>Use consistent naming conventions</li>
                <li>Regular backup of your data</li>
                <li>Test changes in small batches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}