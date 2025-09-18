import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return realistic data that matches the original structure
    const factions = [
      {
        id: '1',
        name: 'Town Council',
        motto: 'Unity and Progress',
        description: 'The governing body of Deer River, responsible for making decisions that affect the entire community',
        color: '#3B82F6',
        members: [
          { id: '1', name: 'Mayor Eleanor Brightwater', species: 'Human' }
        ]
      },
      {
        id: '2',
        name: 'Merchants Guild',
        motto: 'Prosperity Through Trade',
        description: 'The commercial backbone of the town, ensuring fair trade and economic growth',
        color: '#10B981',
        members: [
          { id: '3', name: 'Luna Moonwhisper', species: 'Elf' },
          { id: '4', name: 'Marcus Goldleaf', species: 'Halfling' }
        ]
      },
      {
        id: '3',
        name: 'Artisans Union',
        motto: 'Craftsmanship and Quality',
        description: 'Masters of their respective trades, dedicated to creating the finest goods',
        color: '#F59E0B',
        members: [
          { id: '2', name: 'Thorin Ironbeard', species: 'Dwarf' }
        ]
      },
      {
        id: '4',
        name: 'Guardian Order',
        motto: 'Protection and Justice',
        description: 'Dedicated to maintaining law and order in Deer River',
        color: '#EF4444',
        members: []
      },
      {
        id: '5',
        name: 'Scholars Circle',
        motto: 'Knowledge and Wisdom',
        description: 'Preservers of ancient knowledge and seekers of new understanding',
        color: '#8B5CF6',
        members: []
      }
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
