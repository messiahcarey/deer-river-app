'use client'

import { useState } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: 'Overview', icon: '🏠' },
    { id: 'people', title: 'People Management', icon: '👥' },
    { id: 'factions', title: 'Faction Management', icon: '🏛️' },
    { id: 'buildings', title: 'Building Management', icon: '🏘️' },
    { id: 'map', title: 'Interactive Map', icon: '🗺️' },
    { id: 'analytics', title: 'Analytics & Demographics', icon: '📊' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Help & Documentation
            </h1>
            <p className="text-lg text-gray-600">
              Complete guide to managing your village's residents, factions, buildings, and relationships.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🏠 Application Overview</h2>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-600 mb-6">
                      Deer River is a comprehensive village management system for tracking residents, 
                      factions, buildings, and their relationships. This application helps you 
                      maintain detailed records of your community's social structure.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                      <li>Add residents to your village</li>
                      <li>Create factions to organize your community</li>
                      <li>Add buildings and assign residents to them</li>
                      <li>Use the analytics page to understand your community's demographics</li>
                      <li>Explore the interactive map to visualize your village layout</li>
                    </ol>

                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li><strong>People Management:</strong> Add, edit, and organize residents</li>
                      <li><strong>Faction Management:</strong> Create and manage political/social groups</li>
                      <li><strong>Building Management:</strong> Track structures and their residents</li>
                      <li><strong>Interactive Map:</strong> Visualize your village layout</li>
                      <li><strong>Analytics:</strong> Understand your community's demographics</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* People Management Section */}
              {activeSection === 'people' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 People Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Adding a New Resident</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Go to the People page</li>
                        <li>Click the "New Person" button</li>
                        <li>Fill in the resident's information:
                          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Name:</strong> Full name of the resident</li>
                            <li><strong>Species:</strong> Race or species (Human, Elf, Dwarf, etc.)</li>
                            <li><strong>Age:</strong> Numeric age</li>
                            <li><strong>Occupation:</strong> Job or role</li>
                            <li><strong>Status:</strong> Present, Absent, or other status</li>
                            <li><strong>Lives At:</strong> Which building they live in</li>
                            <li><strong>Works At:</strong> Where they work (optional)</li>
                          </ul>
                        </li>
                        <li>Click "Save Changes"</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Faction Memberships</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Open a resident's edit modal</li>
                        <li>Scroll to the Factions section</li>
                        <li>Select factions from the dropdown (multiple selection allowed)</li>
                        <li>The first selected faction becomes their primary faction</li>
                        <li>Click "Save Changes"</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Creating a Home</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>In a resident's edit modal, click "Create Home"</li>
                        <li>This creates a "Private Residence" building</li>
                        <li>The building gets a sequential number to avoid duplicates</li>
                        <li>The resident is automatically assigned to live there</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Faction Management Section */}
              {activeSection === 'factions' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🏛️ Faction Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Creating a Faction</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Go to the Factions page</li>
                        <li>Click the "New Faction" button</li>
                        <li>Fill in the faction details:
                          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Name:</strong> Faction name</li>
                            <li><strong>Description:</strong> What the faction represents</li>
                            <li><strong>Motto:</strong> Faction slogan (optional)</li>
                            <li><strong>Color:</strong> Faction color for visual identification</li>
                          </ul>
                        </li>
                        <li>Click "Save Changes"</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Members</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Add members by editing individual residents (see People Management)</li>
                        <li>Remove members by editing their faction memberships</li>
                        <li>Set primary faction by selecting it first in the resident's faction list</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Building Management Section */}
              {activeSection === 'buildings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🏘️ Building Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Adding a Building</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Go to the Buildings page</li>
                        <li>Click the "New Building" button</li>
                        <li>Fill in the building details:
                          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Name:</strong> Building name</li>
                            <li><strong>Type:</strong> Residential, Commercial, etc.</li>
                            <li><strong>Capacity:</strong> How many people it can hold</li>
                            <li><strong>Description:</strong> Additional details</li>
                          </ul>
                        </li>
                        <li>Click "Save Changes"</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Residents</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Assign residents to buildings through the People page</li>
                        <li>View building occupancy on the Buildings page</li>
                        <li>Capacity limits are enforced automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Section */}
              {activeSection === 'map' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🗺️ Interactive Map</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Using the Map</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>View your village layout visually</li>
                        <li>See building locations and relationships</li>
                        <li>Understand spatial organization of your community</li>
                        <li>Plan new building placements</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Map Features</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Interactive canvas-based visualization</li>
                        <li>Building placement and management</li>
                        <li>Visual representation of community structure</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Section */}
              {activeSection === 'analytics' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Analytics & Demographics</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Demographics Page</h3>
                      <p className="text-gray-600 mb-4">
                        The Demographics page provides comprehensive analysis of your village's population.
                      </p>
                      
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>Population Overview:</strong> Total residents, species distribution</li>
                        <li><strong>Age Distribution:</strong> Population by age categories</li>
                        <li><strong>Faction Analysis:</strong> Political and social group breakdowns</li>
                        <li><strong>Interactive Charts:</strong> Visual representations of your data</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Charts</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Population pyramid by age and species</li>
                        <li>Species distribution pie chart</li>
                        <li>Faction membership analysis</li>
                        <li>Location-based demographics</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Troubleshooting Section */}
              {activeSection === 'troubleshooting' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Troubleshooting</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Changes Not Saving</h4>
                      <p className="text-yellow-700 text-sm mb-2">
                        If your edits aren't being saved:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                        <li>Check your internet connection</li>
                        <li>Try refreshing the page</li>
                        <li>Make sure you clicked "Save Changes"</li>
                        <li>Check for error messages in the browser console (F12)</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">💡 Performance Tips</h4>
                      <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                        <li>Use filters to find specific residents quickly</li>
                        <li>Bulk operations for multiple changes</li>
                        <li>Regular data cleanup to maintain performance</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">✅ Best Practices</h4>
                      <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                        <li>Keep resident information up to date</li>
                        <li>Use consistent naming conventions</li>
                        <li>Regular backup of your data</li>
                        <li>Test changes in small batches</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Help</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Check this help documentation first</li>
                        <li>Look for error messages in the browser console (F12)</li>
                        <li>Try refreshing the page</li>
                        <li>Contact the development team with specific error details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
