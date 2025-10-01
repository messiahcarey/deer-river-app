import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('Fetching simple dashboard data...')

    // Get basic counts only
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

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Simple Dashboard API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
