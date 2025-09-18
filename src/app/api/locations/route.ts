import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock data for now
    const locations = [
      { id: '1', name: 'Town Square', kind: 'public' },
      { id: '2', name: 'Blacksmith Shop', kind: 'business' },
      { id: '3', name: 'Healing House', kind: 'business' }
    ]

    return NextResponse.json({
      success: true,
      data: locations
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch locations' 
    }, { status: 500 })
  }
}