import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: Request) {
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
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')

    const where = personId ? { personId } : {}

    const memberships = await prisma.personFactionMembership.findMany({
      where,
      select: {
        id: true,
        personId: true,
        factionId: true,
        joinedAt: true,
        leftAt: true,
        role: true,
        isPrimary: true
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

export async function POST(request: Request) {
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
    const body = await request.json()
    const { personId, factionId, role = 'member', isPrimary = false } = body

    if (!personId || !factionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'personId and factionId are required' 
      }, { status: 400 })
    }

    const membership = await prisma.personFactionMembership.create({
      data: {
        personId,
        factionId,
        role,
        isPrimary,
        joinedAt: new Date()
      }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true, data: membership })
  } catch (error) {
    console.error('Memberships POST API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create membership' 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
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
    const { searchParams } = new URL(request.url)
    const membershipId = searchParams.get('id')

    if (!membershipId) {
      return NextResponse.json({ 
        success: false, 
        error: 'membershipId is required' 
      }, { status: 400 })
    }

    await prisma.personFactionMembership.delete({
      where: { id: membershipId }
    })

    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Memberships DELETE API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete membership' 
    }, { status: 500 })
  }
}
