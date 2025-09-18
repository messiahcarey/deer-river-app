import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock data for now
    const factions = [
      { id: '1', name: 'Town Council', color: '#3B82F6' },
      { id: '2', name: 'Merchants Guild', color: '#10B981' },
      { id: '3', name: 'Artisans Union', color: '#F59E0B' }
    ]

    return NextResponse.json({
      success: true,
      data: factions
    })
  } catch (error) {
    console.error('Error fetching factions:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch factions' 
    }, { status: 500 })
  }
}