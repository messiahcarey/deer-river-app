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
            <p>Welcome to Deer River, your village management system.</p>
            
            <h3>People Management</h3>
            <ul>
              <li>Add residents to your village</li>
              <li>Edit resident information</li>
              <li>Manage faction memberships</li>
              <li>Assign residents to buildings</li>
            </ul>

            <h3>Faction Management</h3>
            <ul>
              <li>Create and manage factions</li>
              <li>Add members to factions</li>
              <li>Set primary factions</li>
            </ul>

            <h3>Building Management</h3>
            <ul>
              <li>Add buildings to your village</li>
              <li>Set building capacity</li>
              <li>Assign residents to buildings</li>
            </ul>

            <h3>Analytics</h3>
            <ul>
              <li>View demographic charts</li>
              <li>Analyze population distribution</li>
              <li>Track faction membership</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}