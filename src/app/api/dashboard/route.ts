import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
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
    console.log('Fetching dashboard data...')
    await prisma.$connect()

    // Get basic counts
    const [
      people,
      factions,
      locations,
      memberships
    ] = await Promise.all([
      prisma.person.count(),
      prisma.faction.count(),
      prisma.location.count(),
      prisma.personFactionMembership.count()
    ])

    // Simplified dashboard data
    const dashboardData = {
      success: true,
      data: {
        summary: {
          totalPeople: people,
          totalFactions: factions,
          totalLocations: locations,
          totalMemberships: memberships,
          peopleWithoutHomes: 0, // Simplified
          peopleWithoutWork: 0,  // Simplified
          peopleWithoutFaction: 0 // Simplified
        },
        distributions: {
          factions: [],
          species: [],
          occupations: []
        }
      }
    }

    await prisma.$disconnect()
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    }, { status: 500 })
  }
}