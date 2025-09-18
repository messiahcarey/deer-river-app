import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return realistic data that matches the original structure
    const people = [
      {
        id: '1',
        name: 'Mayor Eleanor Brightwater',
        species: 'Human',
        age: 45,
        occupation: 'Mayor',
        notes: 'Elected leader of Deer River, known for her diplomatic skills',
        tags: 'leadership,diplomatic,charismatic',
        faction: {
          id: '1',
          name: 'Town Council',
          color: '#3B82F6'
        },
        livesAt: {
          id: '1',
          name: 'Mayor\'s Manor',
          kind: 'residence'
        },
        worksAt: {
          id: '2',
          name: 'Town Hall',
          kind: 'government'
        },
        household: {
          id: '1',
          name: 'Brightwater Family'
        }
      },
      {
        id: '2',
        name: 'Thorin Ironbeard',
        species: 'Dwarf',
        age: 180,
        occupation: 'Master Blacksmith',
        notes: 'Legendary craftsman, forges the finest weapons and tools',
        tags: 'skilled,reliable,traditional',
        faction: {
          id: '3',
          name: 'Artisans Union',
          color: '#F59E0B'
        },
        livesAt: {
          id: '3',
          name: 'Ironbeard Forge',
          kind: 'residence'
        },
        worksAt: {
          id: '4',
          name: 'Ironbeard Forge',
          kind: 'business'
        },
        household: {
          id: '2',
          name: 'Ironbeard Clan'
        }
      },
      {
        id: '3',
        name: 'Luna Moonwhisper',
        species: 'Elf',
        age: 250,
        occupation: 'Healer',
        notes: 'Wise healer with deep knowledge of herbs and magic',
        tags: 'magical,wise,compassionate',
        faction: {
          id: '2',
          name: 'Merchants Guild',
          color: '#10B981'
        },
        livesAt: {
          id: '5',
          name: 'Moonwhisper Grove',
          kind: 'residence'
        },
        worksAt: {
          id: '6',
          name: 'Healing House',
          kind: 'business'
        },
        household: {
          id: '3',
          name: 'Moonwhisper Family'
        }
      },
      {
        id: '4',
        name: 'Marcus Goldleaf',
        species: 'Halfling',
        age: 35,
        occupation: 'Merchant',
        notes: 'Successful trader with connections throughout the region',
        tags: 'charismatic,wealthy,well-connected',
        faction: {
          id: '2',
          name: 'Merchants Guild',
          color: '#10B981'
        },
        livesAt: {
          id: '7',
          name: 'Goldleaf Manor',
          kind: 'residence'
        },
        worksAt: {
          id: '8',
          name: 'Goldleaf Trading Post',
          kind: 'business'
        },
        household: {
          id: '4',
          name: 'Goldleaf Family'
        }
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
