'use client'

import React from 'react'
import Link from 'next/link'

export default function InvolvementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🎯 Involvement & Loyalty System
          </h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto mb-6">
            Manage relationships, cohorts, and loyalty dynamics in Deer River.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 Cohorts</h2>
            <p className="text-gray-600 mb-4">Manage groups of people with shared characteristics.</p>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🌱 Seeding</h2>
            <p className="text-gray-600 mb-4">Automatically generate relationships based on policies.</p>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🎪 Events</h2>
            <p className="text-gray-600 mb-4">Create events that affect relationships dynamically.</p>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🕸️ Network</h2>
            <p className="text-gray-600 mb-4">Visualize relationship networks and connections.</p>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Analytics</h2>
            <p className="text-gray-600 mb-4">Monitor system performance and insights.</p>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">⚙️ Settings</h2>
            <p className="text-gray-600 mb-4">Configure system parameters and policies.</p>
            <div className="text-sm text-gray-500">Coming Soon</div>
          </div>
        </div>

        <div className="text-center mt-8">
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
