import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST() {
  try {
    console.log('Seeding basic data...')

    // Ensure the URL starts with the correct protocol
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        success: false,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
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

    // Clear existing data
    await prismaWithEnv.person.deleteMany()
    await prismaWithEnv.location.deleteMany()
    await prismaWithEnv.faction.deleteMany()

    // Create some basic locations
    const townHall = await prismaWithEnv.location.create({
      data: {
        name: "Town Hall",
        x: 0,
        y: 0,
      }
    })

    const generalStore = await prismaWithEnv.location.create({
      data: {
        name: "General Store",
        x: 10,
        y: 5,
      }
    })

    const blacksmith = await prismaWithEnv.location.create({
      data: {
        name: "Blacksmith",
        x: -5,
        y: 10,
      }
    })

    // Create a basic faction
    const townCouncil = await prismaWithEnv.faction.create({
      data: {
        name: "Town Council",
        motto: "For the good of all",
        color: "#3B82F6"
      }
    })

    // Create some basic people
    const mayor = await prismaWithEnv.person.create({
      data: {
        name: "Mayor Johnson",
        species: "Human",
        age: 45,
        occupation: "Mayor",
        tags: "leader,diplomatic",
        livesAtId: townHall.id,
        worksAtId: townHall.id,
      }
    })

    const shopkeeper = await prismaWithEnv.person.create({
      data: {
        name: "Sarah the Shopkeeper",
        species: "Elf",
        age: 32,
        occupation: "Merchant",
        tags: "friendly,wealthy",
        livesAtId: generalStore.id,
        worksAtId: generalStore.id,
      }
    })

    const blacksmithPerson = await prismaWithEnv.person.create({
      data: {
        name: "Thor the Blacksmith",
        species: "Dwarf",
        age: 38,
        occupation: "Blacksmith",
        tags: "strong,craftsman",
        livesAtId: blacksmith.id,
        worksAtId: blacksmith.id,
      }
    })

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        message: "Basic data seeded successfully",
        locations: [townHall, generalStore, blacksmith],
        faction: townCouncil,
        people: [mayor, shopkeeper, blacksmithPerson]
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Seeding failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}
