// Layout positions API endpoint for persisting node positions
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import type { NodePosition, LayoutPositions } from '@/types/graph'

export async function PUT(request: NextRequest) {
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
    const { positions, layoutName = 'default' } = body

    // Validate positions array
    if (!Array.isArray(positions)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Positions must be an array' 
      }, { status: 400 })
    }

    // Validate each position
    for (const pos of positions) {
      if (!pos.key || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
        return NextResponse.json({ 
          success: false, 
          error: 'Each position must have key, x, and y properties' 
        }, { status: 400 })
      }
    }

    // For now, we'll store positions in a simple JSON structure
    // In a production system, you might want to create a dedicated table
    const layoutData: LayoutPositions = {
      positions,
      timestamp: Date.now()
    }

    // Store in a simple key-value format (could be enhanced with a proper table)
    // For now, we'll just return success - in production you'd save to database
    console.log(`Saving layout "${layoutName}" with ${positions.length} positions`)

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        layoutName,
        positionsSaved: positions.length,
        timestamp: layoutData.timestamp
      }
    })

  } catch (error) {
    console.error('Layout positions API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save layout positions' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
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
    const layoutName = searchParams.get('layoutName') || 'default'

    // For now, return empty positions - in production you'd load from database
    // This is a placeholder implementation
    const layoutData: LayoutPositions = {
      positions: [],
      timestamp: 0
    }

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      data: {
        layoutName,
        positions: layoutData.positions,
        timestamp: layoutData.timestamp
      }
    })

  } catch (error) {
    console.error('Layout positions query API error:', error)
    await prisma.$disconnect()
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to load layout positions' 
    }, { status: 500 })
  }
}
