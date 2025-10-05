&apos;use client&apos;

import { useState } from &apos;react&apos;
import Breadcrumbs from &apos;@/components/Breadcrumbs&apos;

interface FeatureStatus {
  name: string
  status: &apos;complete&apos; | &apos;partial&apos; | &apos;incomplete&apos; | &apos;planned&apos;
  description: string
  notes?: string
}

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState(&apos;overview&apos;)

  const featureStatuses: FeatureStatus[] = [
    {
      name: &apos;People Management&apos;,
      status: &apos;complete&apos;,
      description: &apos;Full CRUD operations for residents&apos;,
      notes: &apos;Includes editing, deleting, filtering, sorting, and bulk operations&apos;
    },
    {
      name: &apos;Faction Management&apos;,
      status: &apos;complete&apos;,
      description: &apos;Full CRUD operations for factions&apos;,
      notes: &apos;Includes creating, editing, deleting factions and managing memberships&apos;
    },
    {
      name: &apos;Building Management&apos;,
      status: &apos;complete&apos;,
      description: &apos;Full CRUD operations for buildings&apos;,
      notes: &apos;Includes creating, editing, deleting buildings and managing residents&apos;
    },
    {
      name: &apos;Demographics & Analytics&apos;,
      status: &apos;complete&apos;,
      description: &apos;Comprehensive demographic analysis and charts&apos;,
      notes: &apos;Population pyramids, species distribution, faction analysis, age categories&apos;
    },
    {
      name: &apos;Interactive Map&apos;,
      status: &apos;partial&apos;,
      description: &apos;Canvas-based map with building placement&apos;,
      notes: &apos;Map exists but may need enhancement for better user experience&apos;
    },
    {
      name: &apos;Faction Relationship Diagram&apos;,
      status: &apos;partial&apos;,
      description: &apos;Network visualization of faction relationships&apos;,
      notes: &apos;Component exists but may need data integration and styling improvements&apos;
    },
    {
      name: &apos;Search & Filtering&apos;,
      status: &apos;complete&apos;,
      description: &apos;Advanced filtering and search capabilities&apos;,
      notes: &apos;Multi-select filters, "None" options, real-time search&apos;
    },
    {
      name: &apos;Bulk Operations&apos;,
      status: &apos;complete&apos;,
      description: &apos;Bulk editing and deletion capabilities&apos;,
      notes: &apos;Select multiple items for batch operations&apos;
    },
    {
      name: &apos;Auto-save&apos;,
      status: &apos;complete&apos;,
      description: &apos;Automatic saving of changes&apos;,
      notes: &apos;Changes are saved automatically as you edit&apos;
    },
    {
      name: &apos;Responsive Design&apos;,
      status: &apos;complete&apos;,
      description: &apos;Mobile-friendly interface&apos;,
      notes: &apos;Works on desktop, tablet, and mobile devices&apos;
    },
    {
      name: &apos;Data Export&apos;,
      status: &apos;incomplete&apos;,
      description: &apos;Export data to CSV/Excel&apos;,
      notes: &apos;Not yet implemented - would be useful for data analysis&apos;
    },
    {
      name: &apos;User Authentication&apos;,
      status: &apos;incomplete&apos;,
      description: &apos;User login and role management&apos;,
      notes: &apos;Currently no authentication system&apos;
    },
    {
      name: &apos;Audit Trail&apos;,
      status: &apos;incomplete&apos;,
      description: &apos;Track changes and user actions&apos;,
      notes: &apos;No history of who made what changes when&apos;
    },
    {
      name: &apos;Advanced Reporting&apos;,
      status: &apos;partial&apos;,
      description: &apos;Custom reports and analytics&apos;,
      notes: &apos;Basic demographics exist, but could be expanded&apos;
    },
    {
      name: &apos;Data Backup&apos;,
      status: &apos;incomplete&apos;,
      description: &apos;Automated backup system&apos;,
      notes: &apos;Manual backup process exists but no automation&apos;
    }
  ]

  const sections = [
    { id: &apos;overview&apos;, title: &apos;Overview&apos;, icon: &apos;🏠&apos; },
    { id: &apos;people&apos;, title: &apos;People Management&apos;, icon: &apos;👥&apos; },
    { id: &apos;factions&apos;, title: &apos;Faction Management&apos;, icon: &apos;🏛️&apos; },
    { id: &apos;buildings&apos;, title: &apos;Building Management&apos;, icon: &apos;🏘️&apos; },
    { id: &apos;map&apos;, title: &apos;Interactive Map&apos;, icon: &apos;🗺️&apos; },
    { id: &apos;analytics&apos;, title: &apos;Analytics & Demographics&apos;, icon: &apos;📊&apos; },
    { id: &apos;features&apos;, title: &apos;Feature Status&apos;, icon: &apos;⚙️&apos; },
    { id: &apos;troubleshooting&apos;, title: &apos;Troubleshooting&apos;, icon: &apos;🔧&apos; }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case &apos;complete&apos;: return &apos;text-green-600 bg-green-100&apos;
      case &apos;partial&apos;: return &apos;text-yellow-600 bg-yellow-100&apos;
      case &apos;incomplete&apos;: return &apos;text-red-600 bg-red-100&apos;
      case &apos;planned&apos;: return &apos;text-blue-600 bg-blue-100&apos;
      default: return &apos;text-gray-600 bg-gray-100&apos;
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case &apos;complete&apos;: return &apos;✅&apos;
      case &apos;partial&apos;: return &apos;⚠️&apos;
      case &apos;incomplete&apos;: return &apos;❌&apos;
      case &apos;planned&apos;: return &apos;📋&apos;
      default: return &apos;❓&apos;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏘️ Deer River Help Center
          </h1>
          <p className="text-lg text-gray-600">
            Complete guide to managing your village&apos;s residents, factions, buildings, and relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? &apos;bg-blue-100 text-blue-700&apos;
                          : &apos;text-gray-600 hover:bg-gray-100&apos;
                      }`}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Overview Section */}
              {activeSection === &apos;overview&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🏠 Application Overview</h2>
                  
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-600 mb-6">
                      Deer River is a comprehensive village management system for tracking residents, 
                      factions, buildings, and their relationships. This application helps you 
                      maintain detailed records of your community&apos;s social structure.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">👥 People Management</h3>
                        <p className="text-blue-700 text-sm">
                          Track residents with detailed information including species, age, occupation, 
                          faction memberships, and living arrangements.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-2">🏛️ Faction Management</h3>
                        <p className="text-green-700 text-sm">
                          Manage political and social groups, track memberships, and visualize 
                          relationships between different factions.
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-2">🏘️ Building Management</h3>
                        <p className="text-purple-700 text-sm">
                          Track buildings, their locations, capacity, and current residents. 
                          Manage building types and ownership.
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-2">📊 Analytics</h3>
                        <p className="text-orange-700 text-sm">
                          Comprehensive demographic analysis with charts, population pyramids, 
                          and species distribution visualizations.
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 Getting Started</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Start by adding residents to your village</li>
                      <li>Create factions to organize your community</li>
                      <li>Add buildings and assign residents to them</li>
                      <li>Use the analytics page to understand your community&apos;s demographics</li>
                      <li>Explore the interactive map to visualize your village layout</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* People Management Section */}
              {activeSection === &apos;people&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 People Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Adding New Residents</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Go to the <strong>People</strong> page</li>
                        <li>Click the <strong>&quot;New Person&quot;</strong> button</li>
                        <li>Fill in the resident&apos;s information:
                          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Name:</strong> Full name of the resident</li>
                            <li><strong>Species:</strong> Race or species (Human, Elf, Dwarf, etc.)</li>
                            <li><strong>Age:</strong> Numeric age</li>
                            <li><strong>Occupation:</strong> Job or role</li>
                            <li><strong>Status:</strong> Present, Absent, or other status</li>
                            <li><strong>Lives At:</strong> Which building they live in</li>
                            <li><strong>Works At:</strong> Where they work</li>
                            <li><strong>Factions:</strong> Which factions they belong to</li>
                          </ul>
                        </li>
                        <li>Click <strong>&quot;Save Changes&quot;</strong></li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Editing Residents</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Find the resident in the People table</li>
                        <li>Click the <strong>Edit</strong> button (pencil icon)</li>
                        <li>Make your changes in the modal</li>
                        <li>Changes are saved automatically</li>
                        <li>Use the <strong>"Next Person"</strong> button to cycle through residents</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Faction Memberships</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Open a resident&apos;s edit modal</li>
                        <li>Scroll to the <strong>Factions</strong> section</li>
                        <li>Select factions from the dropdown (multiple selection allowed)</li>
                        <li><strong>First faction selected becomes the primary faction</strong></li>
                        <li>Other factions become secondary memberships</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Creating a Home</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>In a resident&apos;s edit modal, click <strong>"Create Home"</strong></li>
                        <li>This creates a "Private Residence" building</li>
                        <li>The building gets a sequential number to avoid duplicates</li>
                        <li>The resident is automatically assigned to the new building</li>
                        <li>The modal stays open so you can continue editing</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Filtering and Searching</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>Search:</strong> Type in the search box to find residents by name</li>
                        <li><strong>Species Filter:</strong> Filter by species with multi-select options</li>
                        <li><strong>Faction Filter:</strong> Filter by faction membership</li>
                        <li><strong>Status Filter:</strong> Filter by present/absent status</li>
                        <li><strong>Age Filter:</strong> Filter by age range</li>
                        <li><strong>"None" Options:</strong> Find residents with no faction or no building</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Bulk Operations</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Select multiple residents using checkboxes</li>
                        <li>Use <strong>"Bulk Update Status"</strong> to change status for multiple people</li>
                        <li>Use <strong>"Bulk Delete"</strong> to remove multiple residents</li>
                        <li>Get feedback on success/failure counts</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Sorting</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Click column headers to sort by that field</li>
                        <li>Click again to reverse the sort order</li>
                        <li><strong>Age sorting:</strong> Uses numeric comparison (10, 108, 125, etc.)</li>
                        <li><strong>Status colors:</strong> Present = green, Absent = red, others = gray</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Faction Management Section */}
              {activeSection === &apos;factions&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🏛️ Faction Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Creating New Factions</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Go to the <strong>Factions</strong> page</li>
                        <li>Click the <strong>&quot;New Faction&quot;</strong> button</li>
                        <li>Fill in the faction details:
                          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Name:</strong> Faction name (e.g., "Merchant Guild")</li>
                            <li><strong>Motto:</strong> Optional faction motto or slogan</li>
                            <li><strong>Color:</strong> Optional color for visual identification</li>
                          </ul>
                        </li>
                        <li>Click <strong>&quot;Save Changes&quot;</strong></li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Editing Factions</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Find the faction in the factions list</li>
                        <li>Click the <strong>Edit</strong> button (pencil icon)</li>
                        <li>Update the faction information</li>
                        <li>Changes are saved automatically</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Members</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>View faction members in the faction details</li>
                        <li>Add members by editing individual residents (see People Management)</li>
                        <li>Remove members by editing their faction memberships</li>
                        <li>Set primary faction by selecting it first in the resident&apos;s faction list</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Deleting Factions</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Click the <strong>Delete</strong> button (trash icon) next to a faction</li>
                        <li>Confirm the deletion in the modal</li>
                        <li>The faction and all its memberships will be permanently deleted</li>
                        <li>Members will be removed from the faction but not deleted</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Faction Relationships</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>View faction relationship diagrams on the Factions page</li>
                        <li>Visualize connections between different factions</li>
                        <li>Understand the political and social structure of your village</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Building Management Section */}
              {activeSection === &apos;buildings&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🏘️ Building Management</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Adding New Buildings</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Go to the <strong>Map</strong> page</li>
                        <li>Click the <strong>&quot;New Building&quot;</strong> button</li>
                        <li>Fill in the building details:
                          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li><strong>Name:</strong> Building name (e.g., "Town Hall")</li>
                            <li><strong>Type:</strong> Building type (Residence, Shop, Temple, etc.)</li>
                            <li><strong>Capacity:</strong> Maximum number of residents</li>
                            <li><strong>Description:</strong> Optional building description</li>
                          </ul>
                        </li>
                        <li>Click <strong>&quot;Save Changes&quot;</strong></li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Editing Buildings</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Find the building on the Map page</li>
                        <li>Click the <strong>Edit</strong> button (pencil icon)</li>
                        <li>Update the building information</li>
                        <li>Changes are saved automatically</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Managing Residents</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Assign residents to buildings through the People page</li>
                        <li>View building occupancy on the Map page</li>
                        <li>Track capacity vs. current residents</li>
                        <li>Use "Create Home" in People edit modal for private residences</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Building Types</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>Private Residence:</strong> Individual homes</li>
                        <li><strong>Shop:</strong> Commercial buildings</li>
                        <li><strong>Temple:</strong> Religious buildings</li>
                        <li><strong>Guild Hall:</strong> Organization headquarters</li>
                        <li><strong>Inn:</strong> Accommodation for travelers</li>
                        <li><strong>Other:</strong> Custom building types</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Deleting Buildings</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        <li>Click the <strong>Delete</strong> button (trash icon) next to a building</li>
                        <li>Confirm the deletion in the modal</li>
                        <li>The building will be permanently deleted</li>
                        <li>Residents will need to be reassigned to other buildings</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Section */}
              {activeSection === &apos;map&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🗺️ Interactive Map</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Using the Map</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>View all buildings and their locations</li>
                        <li>See building capacity and current residents</li>
                        <li>Click on buildings to view details</li>
                        <li>Add new buildings by clicking "New Building"</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Map Features</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>Building Visualization:</strong> See all buildings as colored rectangles</li>
                        <li><strong>Resident Information:</strong> Hover or click to see building details</li>
                        <li><strong>Capacity Tracking:</strong> Visual indication of building occupancy</li>
                        <li><strong>Building Management:</strong> Edit or delete buildings directly from the map</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Known Limitations</h3>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                        <li>Map positioning is currently basic - buildings are placed in a grid</li>
                        <li>No drag-and-drop repositioning of buildings</li>
                        <li>Limited zoom and pan functionality</li>
                        <li>No street or path visualization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Analytics Section */}
              {activeSection === &apos;analytics&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Analytics & Demographics</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Demographics Page</h3>
                      <p className="text-gray-600 mb-4">
                        The Demographics page provides comprehensive analysis of your village&apos;s population.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">📈 Population Pyramid</h4>
                          <p className="text-blue-700 text-sm">
                            Age distribution by species, showing population structure across different age categories.
                          </p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">🥧 Species Distribution</h4>
                          <p className="text-green-700 text-sm">
                            Pie chart showing the breakdown of different species in your village.
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-2">🏛️ Faction Analysis</h4>
                          <p className="text-purple-700 text-sm">
                            Species distribution across factions, showing political and social structure.
                          </p>
                        </div>
                        
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-900 mb-2">📊 Age Categories</h4>
                          <p className="text-orange-700 text-sm">
                            D&D-based age categories (Child, Young Adult, Adult, Middle Age, Elder).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Chart Types</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>Bar Charts:</strong> Population by age category and species</li>
                        <li><strong>Pie Charts:</strong> Species distribution</li>
                        <li><strong>Heatmaps:</strong> Matrix view of species vs. factions</li>
                        <li><strong>Interactive Charts:</strong> Hover for detailed information</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Dashboard Overview</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>Total population count</li>
                        <li>Species breakdown</li>
                        <li>Faction membership statistics</li>
                        <li>Building occupancy rates</li>
                        <li>Age distribution summary</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Feature Status Section */}
              {activeSection === &apos;features&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Feature Status</h2>
                  
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      This section shows the current status of all features in the Deer River application.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl mb-2">✅</div>
                        <div className="text-sm font-medium text-green-600">Complete</div>
                        <div className="text-xs text-gray-500">Fully functional</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">⚠️</div>
                        <div className="text-sm font-medium text-yellow-600">Partial</div>
                        <div className="text-xs text-gray-500">Needs improvement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">❌</div>
                        <div className="text-sm font-medium text-red-600">Incomplete</div>
                        <div className="text-xs text-gray-500">Not implemented</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">📋</div>
                        <div className="text-sm font-medium text-blue-600">Planned</div>
                        <div className="text-xs text-gray-500">Future feature</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {featureStatuses.map((feature, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="mr-2">{getStatusIcon(feature.status)}</span>
                              <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                              <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                                {feature.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                            {feature.notes && (
                              <p className="text-gray-500 text-xs italic">{feature.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">🚀 Development Roadmap</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Priority improvements for future development:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                      <li>Enhanced map with drag-and-drop building placement</li>
                      <li>Data export functionality (CSV/Excel)</li>
                      <li>User authentication and role management</li>
                      <li>Audit trail for tracking changes</li>
                      <li>Automated backup system</li>
                      <li>Advanced reporting and custom analytics</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Troubleshooting Section */}
              {activeSection === &apos;troubleshooting&apos; && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Troubleshooting</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Issues</h3>
                      
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-400 bg-red-50 p-4">
                          <h4 className="font-semibold text-red-900 mb-2">❌ "Error Loading Data"</h4>
                          <p className="text-red-700 text-sm mb-2">
                            If you see this error on the dashboard or demographics page:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                            <li>Refresh the page</li>
                            <li>Check your internet connection</li>
                            <li>Try again in a few minutes</li>
                            <li>Contact support if the issue persists</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Changes Not Saving</h4>
                          <p className="text-yellow-700 text-sm mb-2">
                            If your edits aren&apos;t being saved:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-yellow-700 text-sm">
                            <li>Make sure you click "Save Changes" after editing</li>
                            <li>Check that all required fields are filled</li>
                            <li>Try refreshing the page and editing again</li>
                            <li>Ensure you have a stable internet connection</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Performance Issues</h4>
                          <p className="text-blue-700 text-sm mb-2">
                            If the application is running slowly:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                            <li>Close other browser tabs</li>
                            <li>Clear your browser cache</li>
                            <li>Try using a different browser</li>
                            <li>Check your internet connection speed</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Compatibility</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li><strong>Recommended:</strong> Chrome, Firefox, Safari, Edge (latest versions)</li>
                        <li><strong>Mobile:</strong> Works on iOS Safari and Android Chrome</li>
                        <li><strong>Not Supported:</strong> Internet Explorer</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Safety</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-600">
                        <li>All data is automatically saved as you make changes</li>
                        <li>Regular backups are performed on the server</li>
                        <li>Deleted items can be recovered from recent backups</li>
                        <li>Contact support for data recovery assistance</li>
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
