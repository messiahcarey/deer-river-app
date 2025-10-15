'use client'

// Main network visualization component using Sigma.js
import { useEffect, useRef, useState, useCallback } from 'react'
import Sigma from 'sigma'
import { GraphBuilder } from '@/lib/graph/GraphBuilder'
import { NodeAttrs, GraphData, GraphFilters } from '@/types/graph'
import { SociogramControls } from './SociogramControls'
import { NodeDetails } from './NodeDetails'

interface SociogramProps {
  initialData?: GraphData
  onNodeClick?: (nodeId: string, attributes: NodeAttrs) => void
  onNodeHover?: (nodeId: string | null, attributes: NodeAttrs | null) => void
  className?: string
}

export function Sociogram({ 
  initialData, 
  onNodeClick, 
  onNodeHover, 
  className = '' 
}: SociogramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sigmaRef = useRef<Sigma | null>(null)
  const graphBuilderRef = useRef<GraphBuilder | null>(null)
  
  const [data, setData] = useState<GraphData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [filters, setFilters] = useState<GraphFilters>({
    kinds: ['person', 'faction', 'household', 'workplace'],
    minInvolvement: 0,
    search: '',
    limit: 100
  })

  // Fetch graph data from API
  const fetchGraphData = useCallback(async (newFilters?: GraphFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentFilters = newFilters || filters
      const params = new URLSearchParams()
      
      if (currentFilters.kinds) {
        params.append('kinds', currentFilters.kinds.join(','))
      }
      if (currentFilters.minInvolvement !== undefined) {
        params.append('minInvolvement', currentFilters.minInvolvement.toString())
      }
      if (currentFilters.search) {
        params.append('search', currentFilters.search)
      }
      if (currentFilters.limit) {
        params.append('limit', currentFilters.limit.toString())
      }

      const response = await fetch(`/api/graph?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch graph data')
      }
    } catch (err) {
      console.error('Failed to fetch graph data:', err)
      setError('Failed to load network data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initialize Sigma.js
  const initializeSigma = useCallback(() => {
    if (!containerRef.current || !data) return

    // Clean up existing instance
    if (sigmaRef.current) {
      sigmaRef.current.kill()
      sigmaRef.current = null
    }

    // Create graph builder and build graph
    const graphBuilder = new GraphBuilder()
    const graph = graphBuilder.buildFromData(data)
    graphBuilderRef.current = graphBuilder

    // Create Sigma instance
    const sigma = new Sigma(graph, containerRef.current, {
      // Node rendering
      nodeReducer: (node, data) => ({
        ...data,
        size: data.size || 8,
        color: data.color || '#4b7bec',
        label: data.label || node,
        borderColor: selectedNode === node ? '#e74c3c' : undefined,
        borderSize: selectedNode === node ? 2 : 0
      }),
      
      // Edge rendering
      edgeReducer: (edge, data) => ({
        ...data,
        size: graphBuilder.getEdgeThickness(data),
        color: graphBuilder.getEdgeColor(data),
        type: graphBuilder.getEdgeStyle(data) === 'dashed' ? 'dashed' : 
              graphBuilder.getEdgeStyle(data) === 'dotted' ? 'dotted' : 'line'
      }),

      // Interaction settings
      enableEdgeEvents: true,

      // Layout settings
      defaultNodeType: 'circle',
      defaultEdgeType: 'line',
      
      // Performance settings
      hideEdgesOnMove: true,
      hideLabelsOnMove: true,
      renderLabels: true,
      labelSize: 12,
      labelWeight: 'normal',
      labelColor: { color: '#2c3e50' }
    })

    // Event handlers
    sigma.on('clickNode', (event) => {
      const nodeId = event.node
      const attributes = graph.getNodeAttributes(nodeId)
      setSelectedNode(nodeId)
      onNodeClick?.(nodeId, attributes as NodeAttrs)
    })

    sigma.on('clickStage', () => {
      setSelectedNode(null)
      // Don't call onNodeClick for stage clicks since it expects a valid nodeId
    })

    sigma.on('enterNode', (event) => {
      const nodeId = event.node
      const attributes = graph.getNodeAttributes(nodeId)
      setHoveredNode(nodeId)
      onNodeHover?.(nodeId, attributes as NodeAttrs)
    })

    sigma.on('leaveNode', () => {
      setHoveredNode(null)
      onNodeHover?.(null, null)
    })

    sigma.on('enterEdge', () => {
      // Could add edge hover effects here
    })

    sigma.on('leaveEdge', () => {
      // Could remove edge hover effects here
    })

    sigmaRef.current = sigma

    // Fit the graph to the container
    setTimeout(() => {
      sigma.getCamera().animatedReset({ duration: 1000 })
    }, 100)

  }, [data, selectedNode, onNodeClick, onNodeHover])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: GraphFilters) => {
    setFilters(newFilters)
    fetchGraphData(newFilters)
  }, [fetchGraphData])


  // Initialize on mount and when data changes
  useEffect(() => {
    if (data) {
      initializeSigma()
    }
  }, [data, initializeSigma])

  // Fetch initial data
  useEffect(() => {
    if (!initialData) {
      fetchGraphData()
    }
  }, [initialData, fetchGraphData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill()
      }
    }
  }, [])

  // Get selected node details
  const selectedNodeDetails = selectedNode && data 
    ? data.nodes.find(node => node.key === selectedNode)
    : null

  // Get hovered node details
  const hoveredNodeDetails = hoveredNode && data 
    ? data.nodes.find(node => node.key === hoveredNode)
    : null

  return (
    <div className={`sociogram-container ${className}`}>
      <div className="flex h-full">
        {/* Main visualization area */}
        <div className="flex-1 relative">
          {/* Controls */}
          <div className="absolute top-4 left-4 z-10">
            <SociogramControls
              filters={filters}
              onFiltersChange={handleFiltersChange}
              loading={loading}
              data={data}
            />
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading network...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-20">
              <div className="text-center p-4">
                <div className="text-red-600 mb-2">⚠️ Error</div>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchGraphData()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Sigma container */}
          <div 
            ref={containerRef} 
            className="w-full h-full bg-gray-50"
            style={{ minHeight: '600px' }}
          />

          {/* Node info overlay */}
          {hoveredNodeDetails && (
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-xs">
              <div className="text-sm">
                <div className="font-semibold text-gray-900">{hoveredNodeDetails.label}</div>
                <div className="text-gray-600 capitalize">{hoveredNodeDetails.kind}</div>
                {hoveredNodeDetails.involvement && (
                  <div className="text-xs text-gray-500">
                    Involvement: {(hoveredNodeDetails.involvement * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Node details panel */}
        {selectedNodeDetails && (
          <div className="w-80 border-l border-gray-200 bg-white">
            <NodeDetails
              node={selectedNodeDetails}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
