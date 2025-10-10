import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST() {
  try {
    console.log('Starting duplicate membership cleanup...')

    // Ensure the URL starts with the correct protocol
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        success: false,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, {
        status: 500
      })
    }

    // Create Prisma client with explicit environment variable
    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    await prismaWithEnv.$connect()

    // Find all active memberships
    const allMemberships = await prismaWithEnv.personFactionMembership.findMany({
      where: {
        leftAt: null // Only active memberships
      },
      include: {
        person: {
          select: { name: true }
        },
        faction: {
          select: { name: true }
        }
      }
    })

    console.log(`Found ${allMemberships.length} active memberships`)

    // Group by personId and factionId to find duplicates
    const membershipGroups = new Map<string, any[]>()
    
    allMemberships.forEach(membership => {
      const key = `${membership.personId}-${membership.factionId}`
      if (!membershipGroups.has(key)) {
        membershipGroups.set(key, [])
      }
      membershipGroups.get(key)!.push(membership)
    })

    const duplicates = Array.from(membershipGroups.entries())
      .filter(([_, memberships]) => memberships.length > 1)

    console.log(`Found ${duplicates.length} duplicate membership groups`)

    const cleanupResults = []

    for (const [key, memberships] of duplicates) {
      const [personId, factionId] = key.split('-')
      const personName = memberships[0].person.name
      const factionName = memberships[0].faction.name
      
      console.log(`Cleaning up duplicates for ${personName} -> ${factionName} (${memberships.length} duplicates)`)

      // Keep the most recent one (highest ID) and mark others as left
      const sortedMemberships = memberships.sort((a, b) => b.id.localeCompare(a.id))
      const keepMembership = sortedMemberships[0]
      const removeMemberships = sortedMemberships.slice(1)

      // Mark the older ones as left
      for (const membership of removeMemberships) {
        await prismaWithEnv.personFactionMembership.update({
          where: { id: membership.id },
          data: { 
            leftAt: new Date(),
            notes: membership.notes ? `${membership.notes} (Removed duplicate)` : 'Removed duplicate'
          }
        })
      }

      cleanupResults.push({
        personName,
        factionName,
        kept: keepMembership.id,
        removed: removeMemberships.map(m => m.id),
        count: removeMemberships.length
      })
    }

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${duplicates.length} duplicate membership groups`,
      results: cleanupResults,
      totalDuplicates: duplicates.length,
      totalRemoved: cleanupResults.reduce((sum, r) => sum + r.count, 0),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error cleaning up duplicates:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500
    })
  }
}
