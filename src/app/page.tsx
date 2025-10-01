import Link from "next/link";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold text-amber-900 mb-4">
            🏰 Deer River
          </h1>
          <p className="text-xl text-amber-700 mb-8">
            Fantasy Town Population Manager
          </p>
          <p className="text-lg text-amber-600 max-w-2xl mx-auto">
            Manage the population, alliances, opinions, and resources of your fantasy town. 
            Track the lives and relationships of every citizen in Deer River.
          </p>
        </header>

        {/* Dashboard */}
        <div className="mb-12">
          <Dashboard />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link 
            href="/people" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">👥</span>
              <h2 className="text-2xl font-semibold text-gray-800">People</h2>
            </div>
            <p className="text-gray-600">
              Manage the citizens of Deer River. View their details, relationships, and opinions.
            </p>
          </Link>

          <Link 
            href="/factions" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-red-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🏛️</span>
              <h2 className="text-2xl font-semibold text-gray-800">Factions</h2>
            </div>
            <p className="text-gray-600">
              Track alliances, rivalries, and political relationships between factions.
            </p>
          </Link>

          <Link 
            href="/map" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🗺️</span>
              <h2 className="text-2xl font-semibold text-gray-800">Map</h2>
            </div>
            <p className="text-gray-600">
              Explore the geography of Deer River and see where everyone lives and works.
            </p>
          </Link>

          <Link 
            href="/resources" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-yellow-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">💰</span>
              <h2 className="text-2xl font-semibold text-gray-800">Resources</h2>
            </div>
            <p className="text-gray-600">
              Monitor the town&apos;s economy and resource management.
            </p>
          </Link>

          <Link 
            href="/analytics" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📊</span>
              <h2 className="text-2xl font-semibold text-gray-800">Analytics</h2>
            </div>
            <p className="text-gray-600">
              Analyze relationships, trends, and patterns in your town.
            </p>
          </Link>

          <Link 
            href="/events" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-indigo-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📝</span>
              <h2 className="text-2xl font-semibold text-gray-800">Events</h2>
            </div>
            <p className="text-gray-600">
              View the audit log of all activities and changes in Deer River.
            </p>
          </Link>

          <Link 
            href="/import" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-emerald-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📊</span>
              <h2 className="text-2xl font-semibold text-gray-800">CSV Import</h2>
            </div>
            <p className="text-gray-600">
              Import resident data from CSV files to populate the database.
            </p>
          </Link>

          <Link 
            href="/admin" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-gray-500"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🔧</span>
              <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
            </div>
            <p className="text-gray-600">
              Monitor application health, performance, and system metrics.
            </p>
          </Link>
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Welcome to Deer River
            </h3>
            <p className="text-gray-600 mb-6">
              This is a fantasy town management application inspired by AD&D 1e. 
              Track the complex social dynamics, political relationships, and economic 
              systems of your fantasy settlement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-amber-50 p-4 rounded">
                <strong>👥 Population:</strong> Manage citizens and their relationships
              </div>
              <div className="bg-amber-50 p-4 rounded">
                <strong>🏛️ Politics:</strong> Track factions and alliances
              </div>
              <div className="bg-amber-50 p-4 rounded">
                <strong>💰 Economy:</strong> Monitor resources and trade
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}