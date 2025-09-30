import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({
        success: false,
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })

    await prismaWithEnv.$connect()

    // Check what tables exist
    const tables = await prismaWithEnv.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    // Check Location table structure
    const locationColumns = await prismaWithEnv.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Location' 
      ORDER BY ordinal_position;
    `

    await prismaWithEnv.$disconnect()

    return NextResponse.json({
      success: true,
      tables: tables,
      locationColumns: locationColumns,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Schema check failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown schema check error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
