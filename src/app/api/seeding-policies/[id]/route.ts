import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const policyId = params.id
    const body = await request.json()
    const { isActive } = body

    const policy = await prisma.seedingPolicy.update({
      where: { id: policyId },
      data: { isActive }
    })

    return NextResponse.json(policy)

  } catch (error) {
    console.error('❌ Failed to update seeding policy:', error)
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
    const policyId = params.id

    await prisma.seedingPolicy.delete({
      where: { id: policyId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Failed to delete seeding policy:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
