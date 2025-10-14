import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const [
      people,
      cohorts,
      policies,
      events,
      effects,
      relationships,
      auditLogs
    ] = await Promise.all([
      prisma.person.count(),
      prisma.cohort.count(),
      prisma.seedingPolicy.count(),
      prisma.event.count(),
      prisma.eventEffect.count(),
      prisma.personRelation.count(),
      prisma.personRelationAudit.count()
    ])

    return NextResponse.json({
      people,
      cohorts,
      policies,
      events,
      effects,
      relationships,
      auditLogs
    })

  } catch (error) {
    console.error('❌ Failed to fetch analytics stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
