import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params
    const person = await prisma.person.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        age: true,
        species: true,
        occupation: true,
        tags: true,
        notes: true,
        livesAt: {
          select: {
            id: true,
            name: true,
            kind: true
          }
        },
        worksAt: {
          select: {
            id: true,
            name: true,
            kind: true
          }
        },
        memberships: {
          select: {
            id: true,
            faction: {
              select: {
                id: true,
                name: true,
                color: true
              }
            },
            role: true,
            isPrimary: true
          }
        }
      }
    })

    if (!person) {
      return NextResponse.json({ 
        success: false, 
        error: 'Person not found' 
      }, { status: 404 })
    }

    await prisma.$disconnect()
    return NextResponse.json({ success: true, data: person })
  } catch (error) {
    console.error('Person API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch person' 
    }, { status: 500 })
  }
}
