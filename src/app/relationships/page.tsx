'use client'

// Main relationships page with network visualization
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { NodeAttrs } from '@/types/graph'

// Dynamically import Sigma.js components to avoid SSR issues
const Sociogram = dynamic(() => import('@/components/Sociogram').then(mod => ({ default: mod.Sociogram })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading network visualization...</div>
})

export default function RelationshipsPage() {
  const [selectedNode, setSelectedNode] = useState<NodeAttrs | null>(null)
  const [hoveredNode, setHoveredNode] = useState<NodeAttrs | null>(null)

  const handleNodeClick = (nodeId: string | null, attributes: NodeAttrs | null) => {
    setSelectedNode(attributes)
  }

  const handleNodeHover = (nodeId: string | null, attributes: NodeAttrs | null) => {
    setHoveredNode(attributes)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Relationship Network</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Explore the social connections and relationships in Deer River
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {hoveredNode && (
                  <div className="text-sm text-gray-600">
                    Hovering: <span className="font-medium">{hoveredNode.label}</span>
                  </div>
                )}
                {selectedNode && (
                  <div className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedNode.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-[800px]">
            <Sociogram
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              className="h-full"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Click</strong> on any node to see detailed information in the side panel</li>
            <li>• <strong>Hover</strong> over nodes to see quick information</li>
            <li>• <strong>Use the controls</strong> in the top-left to filter by node types, involvement, or search</li>
            <li>• <strong>Drag nodes</strong> to rearrange the network layout</li>
            <li>• <strong>Zoom and pan</strong> to explore different areas of the network</li>
          </ul>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Network Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">People</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Factions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Households</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Workplaces</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Edge Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
              <div>• <strong>Solid:</strong> Kinship, Household, Friendship</div>
              <div>• <strong>Dashed:</strong> Work, Merchant</div>
              <div>• <strong>Dotted:</strong> Faction, Event Impact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
