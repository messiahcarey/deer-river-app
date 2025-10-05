'use client'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Help & Documentation
          </h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Getting Started</h2>
              <p className="text-gray-600">
                Deer River is a village management system for tracking residents, factions, buildings, and relationships.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">People Management</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Add residents using the "New Person" button</li>
                <li>Edit resident information by clicking on any person</li>
                <li>Assign residents to factions and buildings</li>
                <li>Use filters to find specific residents</li>
                <li>Bulk operations for multiple residents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Faction Management</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Create factions with the "New Faction" button</li>
                <li>Add members through resident edit modals</li>
                <li>Set primary factions for residents</li>
                <li>Use colors to identify factions visually</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Building Management</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Add buildings with the "New Building" button</li>
                <li>Set building capacity and type</li>
                <li>Assign residents to buildings</li>
                <li>Delete buildings when no longer needed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Analytics</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>View demographic charts and population analysis</li>
                <li>Analyze species and faction distributions</li>
                <li>Track age categories and location data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Troubleshooting</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800 text-sm">
                  If changes aren't saving, check your internet connection and try refreshing the page.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}