// Graph construction and layout logic for network visualization
import Graph from 'graphology'
import { NodeAttrs, EdgeAttrs, GraphData } from '@/types/graph'

export class GraphBuilder {
  private graph: Graph

  constructor() {
    this.graph = new Graph()
  }

  /**
   * Build graph from API data
   */
  public buildFromData(data: GraphData): Graph {
    this.graph.clear()

    // Add nodes
    for (const node of data.nodes) {
      this.graph.addNode(node.key, {
        ...node,
        // Ensure required properties
        x: node.x || Math.random() * 1000,
        y: node.y || Math.random() * 1000,
        size: node.size || this.calculateNodeSize(node),
        color: node.color || this.getNodeColor(node.kind)
      })
    }

    // Add edges
    for (const edge of data.edges) {
      // Only add edge if both nodes exist
      if (this.graph.hasNode(edge.source) && this.graph.hasNode(edge.target)) {
        try {
          this.graph.addEdge(edge.source, edge.target, {
            kind: edge.kind,
            weight: edge.weight || 0.5,
            sentiment: edge.sentiment || 0.0,
            directed: edge.directed || false
          })
        } catch (error) {
          console.error('Error adding edge:', error)
          console.error('Edge data:', edge)
          console.error('Source node exists:', this.graph.hasNode(edge.source))
          console.error('Target node exists:', this.graph.hasNode(edge.target))
        }
      }
    }

    return this.graph
  }

  /**
   * Calculate node size based on involvement score
   */
  private calculateNodeSize(node: NodeAttrs): number {
    const baseSize = 4
    const maxSize = 18
    const involvement = node.involvement || 0.3
    return Math.max(baseSize, Math.min(maxSize, baseSize + (involvement * (maxSize - baseSize))))
  }

  /**
   * Get color for node kind
   */
  private getNodeColor(kind: string): string {
    const colors = {
      person: '#4b7bec',    // blue
      faction: '#e67e22',   // orange
      household: '#16a085', // teal
      workplace: '#8e44ad'  // purple
    }
    return colors[kind as keyof typeof colors] || '#95a5a6' // default gray
  }

  /**
   * Get edge color based on kind and sentiment
   */
  public getEdgeColor(edge: Record<string, unknown>): string {
    const baseColors = {
      kinship: '#2c3e50',     // dark blue-gray
      household: '#16a085',   // teal
      work: '#8e44ad',        // purple
      faction: '#e67e22',     // orange
      patronage: '#f39c12',   // yellow
      friendship: '#27ae60',  // green
      rivalry: '#e74c3c',     // red
      command: '#34495e',     // dark gray
      merchant: '#9b59b6',    // light purple
      event_impact: '#1abc9c' // cyan
    }

    const baseColor = baseColors[edge.kind as string] || '#95a5a6'
    
    // Adjust color based on sentiment
    if ((edge.sentiment as number) > 0.3) {
      return this.lightenColor(baseColor, 0.2) // Positive sentiment - lighter
    } else if ((edge.sentiment as number) < -0.3) {
      return this.darkenColor(baseColor, 0.2) // Negative sentiment - darker
    }
    
    return baseColor
  }

  /**
   * Get edge style based on kind
   */
  public getEdgeStyle(edge: Record<string, unknown>): string {
    const styles = {
      kinship: 'solid',
      household: 'solid',
      work: 'dashed',
      faction: 'dotted',
      patronage: 'solid',
      friendship: 'solid',
      rivalry: 'solid',
      command: 'solid',
      merchant: 'dashed',
      event_impact: 'dotted'
    }
    return styles[edge.kind as string] || 'solid'
  }

  /**
   * Calculate edge thickness based on weight
   */
  public getEdgeThickness(edge: Record<string, unknown>): number {
    const minThickness = 1
    const maxThickness = 4
    const weight = (edge.weight as number) || 0.5
    return minThickness + (weight * (maxThickness - minThickness))
  }

  /**
   * Filter graph by criteria
   */
  public filterGraph(filters: {
    kinds?: string[]
    minInvolvement?: number
    search?: string
    maxNodes?: number
  }): Graph<NodeAttrs, EdgeAttrs> {
    const filteredGraph = new Graph<NodeAttrs, EdgeAttrs>()
    
    // Filter nodes
    const filteredNodes = this.graph.filterNodes((nodeId, attributes) => {
      // Filter by kinds
      if (filters.kinds && filters.kinds.length > 0 && !filters.kinds.includes(attributes.kind)) {
        return false
      }
      
      // Filter by involvement
      if (filters.minInvolvement && (attributes.involvement || 0) < filters.minInvolvement) {
        return false
      }
      
      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesLabel = attributes.label.toLowerCase().includes(searchLower)
        const matchesTags = attributes.tags.some(tag => tag.toLowerCase().includes(searchLower))
        if (!matchesLabel && !matchesTags) {
          return false
        }
      }
      
      return true
    })

    // Limit nodes if specified
    const limitedNodes = filters.maxNodes 
      ? filteredNodes.slice(0, filters.maxNodes)
      : filteredNodes

    // Add filtered nodes
    for (const nodeId of limitedNodes) {
      const attributes = this.graph.getNodeAttributes(nodeId)
      filteredGraph.addNode(nodeId, attributes)
    }

    // Add edges between filtered nodes
    for (const edgeId of this.graph.edges()) {
      const [source, target] = this.graph.extremities(edgeId)
      if (filteredGraph.hasNode(source) && filteredGraph.hasNode(target)) {
        const attributes = this.graph.getEdgeAttributes(edgeId)
        filteredGraph.addEdge(edgeId, source, target, attributes)
      }
    }

    return filteredGraph
  }

  /**
   * Get ego network (1-hop neighborhood) for a node
   */
  public getEgoNetwork(nodeId: string): Graph<NodeAttrs, EdgeAttrs> {
    const egoGraph = new Graph<NodeAttrs, EdgeAttrs>()
    
    if (!this.graph.hasNode(nodeId)) {
      return egoGraph
    }

    // Add center node
    const centerAttributes = this.graph.getNodeAttributes(nodeId)
    egoGraph.addNode(nodeId, centerAttributes)

    // Add neighbors
    for (const neighborId of this.graph.neighbors(nodeId)) {
      const neighborAttributes = this.graph.getNodeAttributes(neighborId)
      egoGraph.addNode(neighborId, neighborAttributes)
    }

    // Add edges within ego network
    for (const edgeId of this.graph.edges()) {
      const [source, target] = this.graph.extremities(edgeId)
      if (egoGraph.hasNode(source) && egoGraph.hasNode(target)) {
        const attributes = this.graph.getEdgeAttributes(edgeId)
        egoGraph.addEdge(edgeId, source, target, attributes)
      }
    }

    return egoGraph
  }

  /**
   * Calculate network metrics
   */
  public calculateMetrics(): {
    totalNodes: number
    totalEdges: number
    averageDegree: number
    density: number
    connectedComponents: number
  } {
    const totalNodes = this.graph.order
    const totalEdges = this.graph.size
    const averageDegree = totalNodes > 0 ? (2 * totalEdges) / totalNodes : 0
    const density = totalNodes > 1 ? (2 * totalEdges) / (totalNodes * (totalNodes - 1)) : 0
    
    // Calculate connected components (simplified)
    const visited = new Set<string>()
    let components = 0
    
    for (const nodeId of this.graph.nodes()) {
      if (!visited.has(nodeId)) {
        components++
        this.dfs(nodeId, visited)
      }
    }

    return {
      totalNodes,
      totalEdges,
      averageDegree,
      density,
      connectedComponents: components
    }
  }

  /**
   * Depth-first search for connected components
   */
  private dfs(nodeId: string, visited: Set<string>): void {
    visited.add(nodeId)
    for (const neighborId of this.graph.neighbors(nodeId)) {
      if (!visited.has(neighborId)) {
        this.dfs(neighborId, visited)
      }
    }
  }

  /**
   * Get graph instance
   */
  public getGraph(): Graph<NodeAttrs, EdgeAttrs> {
    return this.graph
  }

  /**
   * Utility functions for color manipulation
   */
  private lightenColor(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * amount * 100)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  private darkenColor(color: string, amount: number): string {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * amount * 100)
    const R = (num >> 16) - amt
    const G = (num >> 8 & 0x00FF) - amt
    const B = (num & 0x0000FF) - amt
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1)
  }
}
