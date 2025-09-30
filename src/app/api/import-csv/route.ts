import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: Request) {
  try {
    console.log('Starting CSV import...')
    
    // Ensure the URL starts with the correct protocol
    const dbUrl = process.env.DATABASE_URL?.trim()
    if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid DATABASE_URL format: ${dbUrl}`,
        timestamp: new Date().toISOString()
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }
    
    // Create Prisma client with explicit environment variable
    const prismaWithEnv = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl
        }
      }
    })
    
    await prismaWithEnv.$connect()
    
    // Parse the request body
    const formData = await request.formData()
    const csvFile = formData.get('csvFile') as File
    
    if (!csvFile) {
      return NextResponse.json({ 
        success: false, 
        error: 'No CSV file provided',
        timestamp: new Date().toISOString()
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }
    
    // Read and parse CSV file
    const csvText = await csvFile.text()
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const data = lines.slice(1).map(line => {
      const values: string[] = []
      let inQuote = false
      let currentVal = ''
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuote = !inQuote
          if (!inQuote && line[i + 1] === ',') { // End of quoted field
            values.push(currentVal.trim())
            currentVal = ''
            i++ // Skip comma
          }
        } else if (char === ',' && !inQuote) {
          values.push(currentVal.trim())
          currentVal = ''
        } else {
          currentVal += char
        }
      }
      values.push(currentVal.trim()) // Push the last value
      
      const obj: Record<string, string> = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    })
    
    console.log(`Parsed ${data.length} residents from CSV`)
    
    // First, create some basic locations and factions
    const locations = await createBasicLocations(prismaWithEnv)
    const factions = await createBasicFactions(prismaWithEnv)
    
    // Import residents
    const importedResidents = []
    const errors = []
    
    for (const resident of data) {
      if (resident.Name && resident.Name.trim()) {
        try {
          const person = await prismaWithEnv.person.create({
            data: {
              name: resident.Name,
              species: resident.Race || 'Unknown',
              age: resident.Age ? parseInt(resident.Age) : null,
              occupation: resident.Occupation || null,
              notes: resident.Notes || null,
              tags: resident.Presence === 'Present' ? 'present' : 'absent',
              livesAtId: locations['Deer River'].id, // Default to main town
              worksAtId: extractWorkLocation(resident.Occupation, locations)
            }
          })
          importedResidents.push(person)
        } catch (error) {
          errors.push({
            name: resident.Name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }
    
    await prismaWithEnv.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${importedResidents.length} residents`,
      importedCount: importedResidents.length,
      errorCount: errors.length,
      errors: errors,
      locations: Object.keys(locations).length,
      factions: Object.keys(factions).length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('CSV import failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

async function createBasicLocations(prisma: PrismaClient) {
  const locationData = [
    { name: 'Deer River', kind: 'Town', address: 'Main settlement', notes: 'The main town of Deer River' },
    { name: 'Rusty Pike Inn', kind: 'Business', address: 'Main street', notes: 'Tavern and inn run by Rurik Copperpot' },
    { name: 'Forge of Fortune', kind: 'Business', address: 'Blacksmith district', notes: 'Blacksmith shop run by Oswin Finch' },
    { name: 'River\'s Edge Goods', kind: 'Business', address: 'Market square', notes: 'General goods shop run by Torrin' },
    { name: 'Ironclad Armory', kind: 'Business', address: 'Armor district', notes: 'Armor shop run by Eamon Hargrove' },
    { name: 'Marina', kind: 'Dock', address: 'Lustrous Run', notes: 'Ferry dock managed by Valenna Moondancer' }
  ]

  const locations: Record<string, { id: string }> = {}
  
  for (const locData of locationData) {
    let location = await prisma.location.findFirst({
      where: { name: locData.name }
    })
    
    if (!location) {
      location = await prisma.location.create({
        data: locData
      })
    }
    
    locations[locData.name] = { id: location.id }
  }
  
  return locations
}

async function createBasicFactions(prisma: PrismaClient) {
  const factionData = [
    { name: 'Town Council', color: '#4A90E2' },
    { name: 'Guard', color: '#E24A4A' },
    { name: 'Merchants', color: '#4AE24A' },
    { name: 'Refugees', color: '#E2E24A' }
  ]

  const factions: Record<string, { id: string }> = {}
  
  for (const factionDataItem of factionData) {
    let faction = await prisma.faction.findFirst({
      where: { name: factionDataItem.name }
    })
    
    if (!faction) {
      faction = await prisma.faction.create({
        data: factionDataItem
      })
    }
    
    factions[factionDataItem.name] = { id: faction.id }
  }
  
  return factions
}

function extractWorkLocation(occupation: string, locations: Record<string, { id: string }>) {
  if (occupation.includes('Rusty Pike')) return locations['Rusty Pike Inn']?.id
  if (occupation.includes('Forge of Fortune')) return locations['Forge of Fortune']?.id
  if (occupation.includes('River\'s Edge') || occupation.includes('River\'s Edge Goods')) return locations['River\'s Edge Goods']?.id
  if (occupation.includes('Ironclad Armory')) return locations['Ironclad Armory']?.id
  if (occupation.includes('Ferrymaster') || occupation.includes('Marina')) return locations['Moondancer\'s Marina']?.id
  if (occupation.includes('Curiosities')) return locations['Brigid\'s Curiosities']?.id
  return null
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
