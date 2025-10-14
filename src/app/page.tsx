"use client";

import Link from "next/link";
import Dashboard from "@/components/Dashboard";
import WorkflowTemplates from "@/components/WorkflowTemplates";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-large mb-6">
            <span className="text-4xl">🏰</span>
          </div>
          <h1 className="text-7xl font-bold bg-gradient-to-r from-primary-700 to-accent-700 bg-clip-text text-transparent mb-6">
            Deer River
          </h1>
          <p className="text-2xl font-semibold text-secondary-700 mb-4">
            Fantasy Town Population Manager
          </p>
          <p className="text-lg text-secondary-600 max-w-3xl mx-auto leading-relaxed">
            Manage the population, alliances, opinions, and resources of your fantasy town. 
            Track the lives and relationships of every citizen in Deer River with precision and elegance.
          </p>
        </header>

        {/* Page Types - Moved to top */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          <Link 
            href="/people" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-primary-100 hover:border-primary-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">👥</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-primary-700 transition-colors">People</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Manage the citizens of Deer River. View their details, relationships, and opinions.
            </p>
          </Link>

          <Link 
            href="/factions" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-danger-100 hover:border-danger-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏛️</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-danger-700 transition-colors">Factions</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Track alliances, rivalries, and political relationships between factions.
            </p>
          </Link>

          <Link 
            href="/map" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-success-100 hover:border-success-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🗺️</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-success-700 transition-colors">Map</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Explore the geography of Deer River and see where everyone lives and works.
            </p>
          </Link>

          <Link 
            href="/resources" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-warning-100 hover:border-warning-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💰</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-warning-700 transition-colors">Resources</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Monitor the town&apos;s economy and resource management.
            </p>
          </Link>

          <Link 
            href="/demographics" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-accent-100 hover:border-accent-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-accent-700 transition-colors">Demographics</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Explore population analytics, species distribution, and demographic trends.
            </p>
          </Link>

          <Link 
            href="/involvement" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-purple-100 hover:border-purple-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎭</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-purple-700 transition-colors">Involvement & Loyalty</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Advanced relationship management with cohorts, seeding policies, and events.
            </p>
          </Link>

          <Link 
            href="/analytics" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-secondary-200 hover:border-secondary-400 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-secondary-700 transition-colors">Analytics</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Analyze relationships, trends, and patterns in your town.
            </p>
          </Link>

          <Link 
            href="/events" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-primary-100 hover:border-primary-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-primary-700 transition-colors">Events</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              View the audit log of all activities and changes in Deer River.
            </p>
          </Link>

          <Link 
            href="/import" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-success-100 hover:border-success-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📥</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-success-700 transition-colors">Import Data</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Upload CSV files to bulk import residents, buildings, and faction data.
            </p>
          </Link>

          <Link 
            href="/admin" 
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-secondary-200 hover:border-secondary-400 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔧</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-secondary-700 transition-colors">Admin Dashboard</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Monitor application health, performance, and system metrics.
            </p>
          </Link>

          <a
            href="/help.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-medium transition-all duration-300 border border-accent-100 hover:border-accent-300 hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-medium mr-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">❓</span>
              </div>
              <h2 className="text-2xl font-bold text-secondary-800 group-hover:text-accent-700 transition-colors">Help & Documentation</h2>
            </div>
            <p className="text-secondary-600 leading-relaxed">
              Complete guide to using Deer River. Learn about all features and capabilities.
            </p>
          </a>
        </div>

        {/* Dashboard */}
        <div className="mb-12">
          <Dashboard />
        </div>

        {/* Workflow Templates */}
        <div className="mb-12">
          <WorkflowTemplates
            onNewPerson={() => window.location.href = '/people?new=true'}
            onNewFaction={() => window.location.href = '/factions?new=true'}
            onNewBuilding={() => window.location.href = '/map?new=true'}
            onBulkOperation={(operation) => {
              // This would open bulk operation modals
              alert(`Bulk operation: ${operation}`)
            }}
          />
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl shadow-large p-12 max-w-5xl mx-auto border border-primary-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-medium mb-8">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-4xl font-bold text-secondary-800 mb-6">
              Welcome to Deer River
            </h3>
            <p className="text-xl text-secondary-600 mb-10 leading-relaxed max-w-3xl mx-auto">
              This is a fantasy town management application inspired by AD&D 1e. 
              Track the complex social dynamics, political relationships, and economic 
              systems of your fantasy settlement with unprecedented detail and elegance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-2xl border border-primary-200">
                <div className="text-3xl mb-3">👥</div>
                <h4 className="font-bold text-secondary-800 mb-2">Population</h4>
                <p className="text-secondary-600 text-sm">Manage citizens and their relationships</p>
              </div>
              <div className="bg-gradient-to-br from-danger-50 to-danger-100 p-6 rounded-2xl border border-danger-200">
                <div className="text-3xl mb-3">🏛️</div>
                <h4 className="font-bold text-secondary-800 mb-2">Politics</h4>
                <p className="text-secondary-600 text-sm">Track factions and alliances</p>
              </div>
              <div className="bg-gradient-to-br from-warning-50 to-warning-100 p-6 rounded-2xl border border-warning-200">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="font-bold text-secondary-800 mb-2">Economy</h4>
                <p className="text-secondary-600 text-sm">Monitor resources and trade</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}