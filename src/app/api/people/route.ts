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
    const people = await prisma.person.findMany({
      select: {
        id: true,
        name: true,
        age: true,
        species: true,
        occupation: true,
        tags: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true, data: people })
  } catch (error) {
    console.error('People API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch people' 
    }, { status: 500 })
  }
}
