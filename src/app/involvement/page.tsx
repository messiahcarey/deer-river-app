'use client'

import React from 'react'
import Link from 'next/link'

export default function InvolvementDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🎭 Involvement & Loyalty System
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl">
            Manage relationships, cohorts, seeding policies, and events that shape the social dynamics of Deer River.
          </p>
        </header>

        {/* System Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Cohorts</h3>
              <p className="text-sm text-blue-700">Group people by shared characteristics</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Seeding Policies</h3>
              <p className="text-sm text-green-700">Automatically generate relationships</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Events</h3>
              <p className="text-sm text-purple-700">Dynamic relationship modifications</p>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900">Effective Scores</h3>
              <p className="text-sm text-orange-700">Real-time relationship calculations</p>
            </div>
          </div>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cohorts Manager */}
          <Link href="/involvement/cohorts" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-amber-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-amber-600">
                    Cohorts Manager
                  </h3>
                  <p className="text-sm text-gray-500">Manage people groups</p>
                </div>
              </div>
              <p className="text-gray-600">
                Create and manage cohorts of people with shared characteristics. 
                Assign people to groups and track their relationships.
              </p>
            </div>
          </Link>

          {/* Seeding Console */}
          <Link href="/involvement/seeding" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600">
                    Seeding Console
                  </h3>
                  <p className="text-sm text-gray-500">Generate relationships</p>
                </div>
              </div>
              <p className="text-gray-600">
                Create seeding policies and automatically generate relationships 
                between people based on their cohort memberships.
              </p>
            </div>
          </Link>

          {/* Events Panel */}
          <Link href="/involvement/events" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🎭</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-600">
                    Events Panel
                  </h3>
                  <p className="text-sm text-gray-500">Manage events & effects</p>
                </div>
              </div>
              <p className="text-gray-600">
                Create and manage events that dynamically affect relationships. 
                Add effects that modify scores over time.
              </p>
            </div>
          </Link>

          {/* Overrides Editor */}
          <Link href="/involvement/overrides" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-red-600">
                    Overrides Editor
                  </h3>
                  <p className="text-sm text-gray-500">Manual relationship adjustments</p>
                </div>
              </div>
              <p className="text-gray-600">
                Manually override specific relationships between people. 
                Set custom scores and involvement levels.
              </p>
            </div>
          </Link>

          {/* Relationship Network */}
          <Link href="/involvement/network" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">🕸️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                    Relationship Network
                  </h3>
                  <p className="text-sm text-gray-500">Visualize connections</p>
                </div>
              </div>
              <p className="text-gray-600">
                Visualize the relationship network between people. 
                See how events and policies affect the social structure.
              </p>
            </div>
          </Link>

          {/* Analytics Dashboard */}
          <Link href="/involvement/analytics" className="group">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-indigo-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600">
                    Analytics Dashboard
                  </h3>
                  <p className="text-sm text-gray-500">System insights & metrics</p>
                </div>
              </div>
              <p className="text-gray-600">
                Analyze the effectiveness of your involvement system. 
                Track relationship trends and policy impacts.
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="px-4 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors">
              Preview Seeding
            </button>
            <button className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
              Execute Seeding
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors">
              Create Event
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
              View Network
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
