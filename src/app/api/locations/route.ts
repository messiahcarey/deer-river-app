import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return realistic data that matches the original structure
    const locations = [
      {
        id: '1',
        name: 'Mayor\'s Manor',
        kind: 'residence',
        address: '1 Government Square',
        notes: 'Elegant home of the mayor',
        x: 50,
        y: 50,
        capacity: 8,
        residents: [
          { id: '1', name: 'Mayor Eleanor Brightwater', species: 'Human', occupation: 'Mayor' }
        ],
        workers: []
      },
      {
        id: '2',
        name: 'Town Hall',
        kind: 'government',
        address: '1 Government Square',
        notes: 'Center of government and administration',
        x: 100,
        y: 100,
        capacity: 50,
        residents: [],
        workers: [
          { id: '1', name: 'Mayor Eleanor Brightwater', species: 'Human', occupation: 'Mayor' }
        ]
      },
      {
        id: '3',
        name: 'Ironbeard Forge',
        kind: 'business',
        address: '5 Smithy Lane',
        notes: 'Master blacksmith workshop',
        x: 200,
        y: 150,
        capacity: 10,
        residents: [
          { id: '2', name: 'Thorin Ironbeard', species: 'Dwarf', occupation: 'Master Blacksmith' }
        ],
        workers: [
          { id: '2', name: 'Thorin Ironbeard', species: 'Dwarf', occupation: 'Master Blacksmith' }
        ]
      },
      {
        id: '4',
        name: 'Healing House',
        kind: 'business',
        address: '3 Garden Street',
        notes: 'Medical care and healing services',
        x: 150,
        y: 200,
        capacity: 20,
        residents: [],
        workers: [
          { id: '3', name: 'Luna Moonwhisper', species: 'Elf', occupation: 'Healer' }
        ]
      },
      {
        id: '5',
        name: 'Moonwhisper Grove',
        kind: 'residence',
        address: '7 Forest Path',
        notes: 'Peaceful elven home surrounded by nature',
        x: 300,
        y: 250,
        capacity: 6,
        residents: [
          { id: '3', name: 'Luna Moonwhisper', species: 'Elf', occupation: 'Healer' }
        ],
        workers: []
      },
      {
        id: '6',
        name: 'Goldleaf Trading Post',
        kind: 'business',
        address: '2 Market Square',
        notes: 'Busy trading hub for goods and services',
        x: 250,
        y: 100,
        capacity: 30,
        residents: [],
        workers: [
          { id: '4', name: 'Marcus Goldleaf', species: 'Halfling', occupation: 'Merchant' }
        ]
      },
      {
        id: '7',
        name: 'Goldleaf Manor',
        kind: 'residence',
        address: '4 Merchant Row',
        notes: 'Comfortable home of the successful merchant',
        x: 200,
        y: 50,
        capacity: 12,
        residents: [
          { id: '4', name: 'Marcus Goldleaf', species: 'Halfling', occupation: 'Merchant' }
        ],
        workers: []
      }
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
