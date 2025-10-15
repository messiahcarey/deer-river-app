// Graph visualization types for network data

export interface NodeAttrs {
  key: string
  kind: 'person' | 'faction' | 'household' | 'workplace'
  label: string
  involvement: number // 0.0 to 1.0
  loyalty: Record<string, number> // targetId -> loyalty score
  tags: string[]
  x: number
  y: number
  size: number
  color: string
}

export interface EdgeAttrs {
  key: string
  source: string
  target: string
  kind: 'kinship' | 'household' | 'work' | 'faction' | 'patronage' | 'friendship' | 'rivalry' | 'command' | 'merchant' | 'event_impact'
  weight: number // 0.0 to 1.0
  sentiment: number // -1.0 to 1.0
  directed: boolean
}

export interface GraphData {
  nodes: NodeAttrs[]
  edges: EdgeAttrs[]
  metadata: {
    totalNodes: number
    totalEdges: number
    filters: {
      kinds: string[]
      minInvolvement: number
      search: string
      limit: number
    }
  }
}

export interface GraphFilters {
  kinds?: string[]
  minInvolvement?: number
  search?: string
  limit?: number
}

export interface NodePosition {
  key: string
  x: number
  y: number
}

export interface LayoutPositions {
  positions: NodePosition[]
  timestamp: number
}
