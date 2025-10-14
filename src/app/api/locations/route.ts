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
    const locations = await prisma.location.findMany({
      select: {
        id: true,
        name: true,
        kind: true,
        x: true,
        y: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true, data: locations })
  } catch (error) {
    console.error('Locations API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch locations' 
    }, { status: 500 })
  }
}
