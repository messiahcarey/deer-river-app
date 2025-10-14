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
    const memberships = await prisma.personFactionMembership.findMany({
      select: {
        id: true,
        personId: true,
        factionId: true,
        joinedAt: true,
        leftAt: true
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true, data: memberships })
  } catch (error) {
    console.error('Memberships API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch memberships' 
    }, { status: 500 })
  }
}
