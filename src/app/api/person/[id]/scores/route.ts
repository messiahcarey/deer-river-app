// Person scores API endpoint for detailed profile with involvement and loyalty scores
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const personId = params.id

    // Get person with all related data
    const person = await prisma.person.findUnique({
      where: { id: personId },
      include: {
        involvementScore: true,
        loyaltyScores: {
          include: {
            person: {
              select: { id: true, name: true }
            }
          },
          orderBy: { score: 'desc' }
        },
        memberships: {
          include: {
            faction: {
              select: { id: true, name: true, color: true }
            }
          }
        },
        household: {
          include: {
            residents: {
              select: { id: true, name: true, species: true }
            }
          }
        },
        workplace: {
          include: {
            workers: {
              select: { id: true, name: true, species: true }
            }
          }
        },
        fromRelationships: {
          include: {
            dst: {
              select: { id: true, name: true, species: true }
            }
          },
          orderBy: { weight: 'desc' }
        },
        toRelationships: {
          include: {
            src: {
              select: { id: true, name: true, species: true }
            }
          },
          orderBy: { weight: 'desc' }
        }
      }
    })

    if (!person) {
      return NextResponse.json({ 
        success: false, 
        error: 'Person not found' 
      }, { status: 404 })
    }

    // Transform loyalty scores to include target names
    const loyaltyScores = person.loyaltyScores.map(score => ({
      id: score.id,
      targetId: score.targetId,
      score: score.score,
      window: score.window,
      breakdown: score.breakdown,
      updatedAt: score.updatedAt,
      // Try to find target name from factions or other sources
      targetName: score.targetId // For now, just use ID - could be enhanced
    }))

    // Combine all relationships
    const allRelationships = [
      ...person.fromRelationships.map(rel => ({
        id: rel.id,
        kind: rel.kind,
        weight: rel.weight,
        sentiment: rel.sentiment,
        directed: rel.directed,
        metadata: rel.metadata,
        otherPerson: rel.dst,
        direction: 'from' as const
      })),
      ...person.toRelationships.map(rel => ({
        id: rel.id,
        kind: rel.kind,
        weight: rel.weight,
        sentiment: rel.sentiment,
        directed: rel.directed,
        metadata: rel.metadata,
        otherPerson: rel.src,
        direction: 'to' as const
      }))
    ].sort((a, b) => b.weight - a.weight) // Sort by weight descending

    // Calculate network metrics
    const networkMetrics = {
      totalRelationships: allRelationships.length,
      averageRelationshipWeight: allRelationships.length > 0 
        ? allRelationships.reduce((sum, rel) => sum + rel.weight, 0) / allRelationships.length 
        : 0,
      averageSentiment: allRelationships.length > 0 
        ? allRelationships.reduce((sum, rel) => sum + rel.sentiment, 0) / allRelationships.length 
        : 0,
      relationshipTypes: allRelationships.reduce((acc, rel) => {
        acc[rel.kind] = (acc[rel.kind] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }

    // Build comprehensive profile
    const profile = {
      // Basic person info
      id: person.id,
      name: person.name,
      species: person.species,
      age: person.age,
      occupation: person.occupation,
      tags: person.tags.split(',').map(t => t.trim()).filter(t => t),
      notes: person.notes,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,

      // Involvement score
      involvement: person.involvementScore ? {
        score: person.involvementScore.score,
        window: person.involvementScore.window,
        breakdown: person.involvementScore.breakdown,
        updatedAt: person.involvementScore.updatedAt
      } : null,

      // Loyalty scores
      loyaltyScores,

      // Faction memberships
      memberships: person.memberships.map(membership => ({
        id: membership.id,
        faction: membership.faction,
        role: membership.role,
        isPrimary: membership.isPrimary,
        alignment: membership.alignment,
        joinedAt: membership.joinedAt
      })),

      // Household info
      household: person.household ? {
        id: person.household.id,
        name: person.household.name,
        locationId: person.household.locationId,
        notes: person.household.notes,
        residents: person.household.residents
      } : null,

      // Workplace info
      workplace: person.workplace ? {
        id: person.workplace.id,
        name: person.workplace.name,
        type: person.workplace.type,
        location: person.workplace.location,
        notes: person.workplace.notes,
        workers: person.workplace.workers
      } : null,

      // Relationships
      relationships: allRelationships,

      // Network metrics
      networkMetrics,

      // Legacy location info (for backward compatibility)
      livesAtId: person.livesAtId,
      worksAtId: person.worksAtId
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Person scores API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch person scores' 
    }, { status: 500 })
  }
}
