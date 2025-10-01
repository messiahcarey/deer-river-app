import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(
  request: NextRequest,
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
    await prisma.$connect()
    const { id } = await params

    const membership = await prisma.personFactionMembership.findUnique({
      where: { id },
      include: {
        faction: true,
        person: true
      }
    })

    if (!membership) {
      return NextResponse.json(
        { 
          ok: false, 
          data: null, 
          error: 'Membership not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      ok: true, 
      data: membership,
      error: null 
    })
  } catch (error: unknown) {
    console.error('Error fetching membership:', error)
    return NextResponse.json(
      { 
        ok: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
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
    await prisma.$connect()
    const { id } = await params
    const body = await request.json()

    // If setting as primary, remove primary status from other memberships
    if (body.isPrimary === true) {
      const membership = await prisma.personFactionMembership.findUnique({
        where: { id },
        select: { personId: true }
      })

      if (membership) {
        await prisma.personFactionMembership.updateMany({
          where: {
            personId: membership.personId,
            isPrimary: true,
            leftAt: null,
            id: { not: id }
          },
          data: { isPrimary: false }
        })
      }
    }

    const updatedMembership = await prisma.personFactionMembership.update({
      where: { id },
      data: {
        role: body.role ?? undefined,
        isPrimary: typeof body.isPrimary === 'boolean' ? body.isPrimary : undefined,
        alignment: typeof body.alignment === 'number' ? body.alignment : undefined,
        openness: typeof body.openness === 'number' ? body.openness : undefined,
        leftAt: body.leftAt === null ? null : (body.leftAt ? new Date(body.leftAt) : undefined),
        notes: body.notes ?? undefined
      },
      include: {
        faction: true,
        person: true
      }
    })

    return NextResponse.json({ 
      ok: true, 
      data: updatedMembership,
      error: null 
    })
  } catch (error: unknown) {
    console.error('Error updating membership:', error)
    return NextResponse.json(
      { 
        ok: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
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
    await prisma.$connect()

    const { id } = await params

    // Soft delete by setting leftAt
    const membership = await prisma.personFactionMembership.update({
      where: { id },
      data: { leftAt: new Date() },
      include: {
        faction: true,
        person: true
      }
    })

    return NextResponse.json({ 
      ok: true, 
      data: membership,
      error: null 
    })
  } catch (error: unknown) {
    console.error('Error deleting membership:', error)
    return NextResponse.json(
      { 
        ok: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
