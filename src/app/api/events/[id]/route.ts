import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await request.json()
    const { isActive } = body

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isActive }
    })

    return NextResponse.json(event)

  } catch (error) {
    console.error('❌ Failed to update event:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    await prisma.event.delete({
      where: { id: eventId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Failed to delete event:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
