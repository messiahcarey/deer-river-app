// Graph API endpoint for network visualization data
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { NodeAttrs, EdgeAttrs } from '@/types/graph'

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim()
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database connection not configured' 
    }, { status: 500 })
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
  })

  try {
    const { searchParams } = new URL(request.url)
    const kinds = searchParams.get('kinds')?.split(',') || ['person', 'faction', 'household', 'workplace']
    const minInvolvement = parseFloat(searchParams.get('minInvolvement') || '0')
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    // Get all nodes based on requested kinds
    const nodes: NodeAttrs[] = []

    // Add person nodes
    if (kinds.includes('person')) {
      const people = await prisma.person.findMany({
        include: {
          involvementScore: true,
          loyaltyScores: {
            take: 3,
            orderBy: { score: 'desc' }
          },
          memberships: {
            include: { faction: true }
          },
          household: true,
          workplace: true
        },
        take: limit
      })

      for (const person of people) {
        // Apply involvement filter
        if (person.involvementScore && person.involvementScore.score < minInvolvement) {
          continue
        }

        // Apply search filter
        if (search && !person.name.toLowerCase().includes(search.toLowerCase()) && 
            !person.tags.toLowerCase().includes(search.toLowerCase())) {
          continue
        }

        // Build loyalty object for top targets
        const loyalty: Record<string, number> = {}
        for (const loyaltyScore of person.loyaltyScores) {
          loyalty[loyaltyScore.targetId] = loyaltyScore.score
        }

        nodes.push({
          key: `person:${person.id}`,
          kind: 'person',
          label: person.name,
          involvement: person.involvementScore?.score || 0.3,
          loyalty,
          tags: person.tags.split(',').map(t => t.trim()).filter(t => t),
          x: Math.random() * 1000, // Will be overridden by layout
          y: Math.random() * 1000,
          size: Math.max(4, Math.min(18, Math.round((person.involvementScore?.score || 0.3) * 18))),
          color: '#4b7bec' // Person color
        })
      }
    }

    // Add faction nodes
    if (kinds.includes('faction')) {
      const factions = await prisma.faction.findMany({
        include: {
          memberships: {
            include: { person: true }
          }
        },
        take: limit
      })

      for (const faction of factions) {
        // Apply search filter
        if (search && !faction.name.toLowerCase().includes(search.toLowerCase())) {
          continue
        }

        nodes.push({
          key: `faction:${faction.id}`,
          kind: 'faction',
          label: faction.name,
          involvement: Math.min(faction.memberships.length / 10, 1.0), // Proxy involvement
          loyalty: {},
          tags: ['faction'],
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          size: Math.max(8, Math.min(20, faction.memberships.length + 8)),
          color: '#e67e22' // Faction color
        })
      }
    }

    // Add household nodes
    if (kinds.includes('household')) {
      const households = await prisma.household.findMany({
        include: {
          residents: true
        },
        take: limit
      })

      for (const household of households) {
        // Apply search filter
        if (search && !household.name?.toLowerCase().includes(search.toLowerCase())) {
          continue
        }

        nodes.push({
          key: `household:${household.id}`,
          kind: 'household',
          label: household.name || 'Unnamed Household',
          involvement: Math.min(household.residents.length / 5, 1.0), // Proxy involvement
          loyalty: {},
          tags: ['household'],
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          size: Math.max(6, Math.min(16, household.residents.length + 6)),
          color: '#16a085' // Household color
        })
      }
    }

    // Add workplace nodes
    if (kinds.includes('workplace')) {
      const workplaces = await prisma.workplace.findMany({
        include: {
          workers: true
        },
        take: limit
      })

      for (const workplace of workplaces) {
        // Apply search filter
        if (search && !workplace.name.toLowerCase().includes(search.toLowerCase())) {
          continue
        }

        nodes.push({
          key: `workplace:${workplace.id}`,
          kind: 'workplace',
          label: workplace.name,
          involvement: Math.min(workplace.workers.length / 8, 1.0), // Proxy involvement
          loyalty: {},
          tags: ['workplace', workplace.type || 'unknown'],
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          size: Math.max(6, Math.min(16, workplace.workers.length + 6)),
          color: '#8e44ad' // Workplace color
        })
      }
    }

    // Get all edges (relationships)
    const edges: EdgeAttrs[] = []
    const relationships = await prisma.relationship.findMany({
      include: {
        src: true,
        dst: true
      },
      take: limit * 2 // More edges than nodes
    })

    for (const relationship of relationships) {
      const srcKey = `person:${relationship.srcId}`
      const dstKey = `person:${relationship.dstId}`

      // Only include edges between nodes that are in our filtered set
      const srcNode = nodes.find(n => n.key === srcKey)
      const dstNode = nodes.find(n => n.key === dstKey)

      if (srcNode && dstNode) {
        edges.push({
          key: `edge:${relationship.id}`,
          source: srcKey,
          target: dstKey,
          kind: relationship.kind.toLowerCase() as EdgeAttrs['kind'],
          weight: relationship.weight,
          sentiment: relationship.sentiment,
          directed: relationship.directed
        })
      }
    }

    // Add faction membership edges
    const memberships = await prisma.personFactionMembership.findMany({
      include: {
        person: true,
        faction: true
      },
      take: limit
    })

    for (const membership of memberships) {
      const personKey = `person:${membership.personId}`
      const factionKey = `faction:${membership.factionId}`

      const personNode = nodes.find(n => n.key === personKey)
      const factionNode = nodes.find(n => n.key === factionKey)

      if (personNode && factionNode) {
        edges.push({
          key: `membership:${membership.id}`,
          source: personKey,
          target: factionKey,
          kind: 'faction',
          weight: membership.isPrimary ? 0.9 : 0.6,
          sentiment: membership.alignment / 100, // Convert from -100..100 to -1..1
          directed: true
        })
      }
    }

    // Add household residence edges
    const peopleWithHouseholds = await prisma.person.findMany({
      where: { householdId: { not: null } },
      include: { household: true },
      take: limit
    })

    for (const person of peopleWithHouseholds) {
      if (person.householdId) {
        const personKey = `person:${person.id}`
        const householdKey = `household:${person.householdId}`

        const personNode = nodes.find(n => n.key === personKey)
        const householdNode = nodes.find(n => n.key === householdKey)

        if (personNode && householdNode) {
          edges.push({
            key: `residence:${person.id}:${person.householdId}`,
            source: personKey,
            target: householdKey,
            kind: 'household',
            weight: 0.8,
            sentiment: 0.5,
            directed: false
          })
        }
      }
    }

    // Add workplace edges
    const peopleWithWorkplaces = await prisma.person.findMany({
      where: { workplaceId: { not: null } },
      include: { workplace: true },
      take: limit
    })

    for (const person of peopleWithWorkplaces) {
      if (person.workplaceId) {
        const personKey = `person:${person.id}`
        const workplaceKey = `workplace:${person.workplaceId}`

        const personNode = nodes.find(n => n.key === personKey)
        const workplaceNode = nodes.find(n => n.key === workplaceKey)

        if (personNode && workplaceNode) {
          edges.push({
            key: `work:${person.id}:${person.workplaceId}`,
            source: personKey,
            target: workplaceKey,
            kind: 'work',
            weight: 0.7,
            sentiment: 0.6,
            directed: false
          })
        }
      }
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        nodes,
        edges,
        metadata: {
          totalNodes: nodes.length,
          totalEdges: edges.length,
          filters: {
            kinds,
            minInvolvement,
            search,
            limit
          }
        }
      }
    })

  } catch (error) {
    console.error('Graph API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch graph data' 
    }, { status: 500 })
  }
}
