import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const dbUrl = process.env.DATABASE_URL?.trim()
if (!dbUrl || (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://"))) {
  console.error("Database connection not configured")
}

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })

export async function POST(request: NextRequest) {
  try {
    console.log("Starting duplicate cleanup...")
    
    // Find duplicates
    const duplicates = await prisma.$queryRaw`
      WITH duplicates AS (
        SELECT 
          pfm.id,
          pfm.person_id,
          pfm.faction_id,
          ROW_NUMBER() OVER (
            PARTITION BY pfm.person_id, pfm.faction_id 
            ORDER BY pfm.id DESC
          ) as rn
        FROM person_faction_membership pfm
        WHERE pfm.left_at IS NULL
      )
      SELECT id FROM duplicates WHERE rn > 1
    ` as Array<{ id: string }>

    console.log(`Found ${duplicates.length} duplicates to remove`)

    if (duplicates.length > 0) {
      // Update duplicates to mark them as left
      const result = await prisma.$executeRaw`
        WITH duplicates AS (
          SELECT 
            pfm.id,
            pfm.person_id,
            pfm.faction_id,
            ROW_NUMBER() OVER (
              PARTITION BY pfm.person_id, pfm.faction_id 
              ORDER BY pfm.id DESC
            ) as rn
          FROM person_faction_membership pfm
          WHERE pfm.left_at IS NULL
        )
        UPDATE person_faction_membership 
        SET 
          left_at = NOW(),
          notes = COALESCE(notes, "") || " (Removed duplicate)"
        WHERE id IN (
          SELECT id FROM duplicates WHERE rn > 1
        )
      `

      console.log(`Updated ${result} duplicate records`)
    }

    // Get final count
    const finalCount = await prisma.personFactionMembership.count({
      where: { leftAt: null }
    })

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${duplicates.length} duplicates`,
      duplicatesRemoved: duplicates.length,
      remainingMemberships: finalCount
    })

  } catch (error) {
    console.error("Error cleaning duplicates:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
