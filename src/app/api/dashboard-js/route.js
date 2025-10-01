// JavaScript version of dashboard API for better Amplify compatibility
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Fetching dashboard data (JS version)...')

    // Get only basic counts - no complex queries
    const people = await prisma.person.count()
    const factions = await prisma.faction.count()
    const locations = await prisma.location.count()
    const memberships = await prisma.personFactionMembership.count()

    const dashboardData = {
      summary: {
        totalPeople: people,
        totalFactions: factions,
        totalLocations: locations,
        totalMemberships: memberships,
        peopleWithoutHomes: 0,
        peopleWithoutWork: 0,
        peopleWithoutFaction: 0
      },
      distributions: {
        factions: [],
        species: [],
        occupations: []
      },
      recentActivity: {
        people: [],
        factions: [],
        locations: []
      }
    }

    console.log('Dashboard data fetched successfully:', dashboardData)

    return Response.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error.message
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
