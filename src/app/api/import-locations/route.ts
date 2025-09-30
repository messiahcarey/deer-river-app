import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: Request) {
  try {
    console.log('Starting location import...')
    
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
    
    console.log(`Parsed ${data.length} locations from CSV`)
    
    // Import locations
    const importedLocations = []
    const errors = []
    
    for (const location of data) {
      if (location.Name && location.Name.trim()) {
        try {
          // Check if location already exists
          const existingLocation = await prismaWithEnv.location.findFirst({
            where: { name: location.Name }
          })
          
          let loc
          if (existingLocation) {
            // Update existing location
            loc = await prismaWithEnv.location.update({
              where: { id: existingLocation.id },
              data: {
                x: location.X ? parseFloat(location.X) : null,
                y: location.Y ? parseFloat(location.Y) : null
              }
            })
          } else {
            // Create new location
            loc = await prismaWithEnv.location.create({
              data: {
                name: location.Name,
                kind: 'building', // Default to building for imported locations
                x: location.X ? parseFloat(location.X) : null,
                y: location.Y ? parseFloat(location.Y) : null
              }
            })
          }
          importedLocations.push(loc)
        } catch (error) {
          errors.push({
            name: location.Name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
    }
    
    await prismaWithEnv.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${importedLocations.length} locations`,
      importedCount: importedLocations.length,
      errorCount: errors.length,
      errors: errors,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error('Location import failed:', error)
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
