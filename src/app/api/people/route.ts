import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock data for now
    const people = [
      {
        id: '1',
        name: 'John Doe',
        species: 'Human',
        age: 35,
        occupation: 'Blacksmith',
        notes: 'Master craftsman',
        tags: 'skilled,reliable',
        faction: null,
        livesAt: null,
        worksAt: null,
        household: null
      },
      {
        id: '2',
        name: 'Jane Smith',
        species: 'Elf',
        age: 120,
        occupation: 'Healer',
        notes: 'Wise and kind',
        tags: 'magical,wise',
        faction: null,
        livesAt: null,
        worksAt: null,
        household: null
      }
    ]

    return NextResponse.json({
      success: true,
      data: people
    })
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch people' 
    }, { status: 500 })
  }
}