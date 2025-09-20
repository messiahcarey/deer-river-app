import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST() {
  try {
    console.log('Creating database schema...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
    
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
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }
    
    // Create Prisma client with explicit environment variable
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })
    
    // Test connection and create tables by running a simple query
    await prisma.$connect()
    
    // Create all tables from the schema
    const tables = [
      // ResourceCategory table (no dependencies)
      `CREATE TABLE IF NOT EXISTS "ResourceCategory" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "unit" TEXT NOT NULL,
        "notes" TEXT
      );`,
      
      // Location table (no dependencies)
      `CREATE TABLE IF NOT EXISTS "Location" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "kind" TEXT NOT NULL,
        "parentId" TEXT,
        "x" REAL,
        "y" REAL,
        "address" TEXT,
        "notes" TEXT
      );`,
      
      // Faction table (no dependencies)
      `CREATE TABLE IF NOT EXISTS "Faction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "motto" TEXT,
        "description" TEXT,
        "color" TEXT
      );`,
      
      // Household table (depends on Location)
      `CREATE TABLE IF NOT EXISTS "Household" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "locationId" TEXT NOT NULL,
        "notes" TEXT
      );`,
      
      // Person table (depends on Faction, Household, Location)
      `CREATE TABLE IF NOT EXISTS "Person" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "species" TEXT NOT NULL,
        "age" INTEGER,
        "occupation" TEXT,
        "factionId" TEXT,
        "householdId" TEXT,
        "livesAtId" TEXT NOT NULL,
        "worksAtId" TEXT,
        "tags" TEXT NOT NULL,
        "notes" TEXT
      );`,
      
      // Opinion table (depends on Person)
      `CREATE TABLE IF NOT EXISTS "Opinion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "fromPersonId" TEXT NOT NULL,
        "toPersonId" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "reason" TEXT,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("fromPersonId", "toPersonId")
      );`,
      
      // PersonFactionMembership table (depends on Person and Faction)
      `CREATE TABLE IF NOT EXISTS "PersonFactionMembership" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "personId" TEXT NOT NULL,
        "factionId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'member',
        "isPrimary" BOOLEAN NOT NULL DEFAULT false,
        "alignment" INTEGER NOT NULL DEFAULT 0,
        "openness" INTEGER NOT NULL DEFAULT 50,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "leftAt" TIMESTAMP,
        "notes" TEXT
      );`,
      
      // FactionOpinion table (depends on Person and Faction)
      `CREATE TABLE IF NOT EXISTS "FactionOpinion" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "personId" TEXT NOT NULL,
        "factionId" TEXT NOT NULL,
        "score" INTEGER NOT NULL,
        "reason" TEXT,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("personId", "factionId")
      );`,
      
      // Alliance table (depends on Faction)
      `CREATE TABLE IF NOT EXISTS "Alliance" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "factionAId" TEXT NOT NULL,
        "factionBId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "stance" TEXT NOT NULL,
        "notes" TEXT,
        "startedAt" TIMESTAMP,
        UNIQUE("factionAId", "factionBId")
      );`,
      
      // TownResourceLedger table (depends on ResourceCategory, Person, Faction)
      `CREATE TABLE IF NOT EXISTS "TownResourceLedger" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TIMESTAMP NOT NULL,
        "resourceCategoryId" TEXT NOT NULL,
        "delta" REAL NOT NULL,
        "reason" TEXT NOT NULL,
        "sourcePersonId" TEXT,
        "sourceFactionId" TEXT
      );`,
      
      // EventLog table (depends on Location)
      `CREATE TABLE IF NOT EXISTS "EventLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TIMESTAMP NOT NULL,
        "title" TEXT NOT NULL,
        "details" TEXT,
        "locationId" TEXT
      );`
    ]
    
    // Execute all table creation queries
    for (const query of tables) {
      await prisma.$executeRawUnsafe(query)
    }
    
    const result = "All tables created successfully"
    
    console.log('Schema creation result:', result)
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database schema created successfully',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Schema creation failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
