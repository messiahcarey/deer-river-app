import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    
    // First, create some basic locations and factions
    const locations = await createBasicLocations(prismaWithEnv)
    const factions = await createBasicFactions(prismaWithEnv)
    
    // Parse CSV data
    const csvData = `Name,Race,Age,Occupation,Presence,Notes
Rurik Copperpot,Human,58,Innkeeper (Rusty Pike Inn/Tavern),Present,"Boisterous; stout, large nose; pragmatic about adventurers."
Oswin Finch,Human,8,Blacksmith (Forge of Fortune),Present,"Wispy grey beard, missing left ear; serious, grim worker."
Torrin,Human,44,Shopkeeper (River's Edge Goods),Present,"Gruff, impatient, protective; tolerates adventurers for coin."
Eamon Hargrove,Human,65,Armorer (Ironclad Armory),Present,"Stoic, unyielding; balding with deep wrinkles."
Brigid Stormaxe,Dwarf,62,Retired adventurer; Curiosities shop,Absent,"One-eyed, grizzled Fighter/Thief; storyteller; sells relics."
Valenna Moondancer,Half-elf,108,Retired ranger; Ferrymaster (Marina),Present,"Slim, dark hair in braids; discreet; ferries across Lustrous Run."
Jaren Swiftblade,Human,56,Retired fighter (mentor),Absent,Survived near-death in Black Marsh; drinks at Rusty Pike; left after hearing of blue dragon.
Alric Fenlow,Human,72,Retired farmer,Present,"Crumbling riverside house, small vegetable patch, fiercely independent."
Serida Vale,Half-elf,86,"Widow, seamstress (retired)",Present,"Keeps to herself, still darns clothes; house is fairly well maintained."
Tomasin Grell,Human,68,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Ivor Hemsley,Human,56,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Coren Duthane,Half-elf,81,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Marella Brightrun,Human,64,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Odran Pell,Human,69,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Helvi Thorne,Human,68,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Ansel Drowick,Half-elf,58,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Petra Kells,Half-elf,56,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Garrin Moat,Human,75,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Selda Farrow,Half-elf,57,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Edric Vane,Half-elf,77,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Milna Carrow,Human,69,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Harwin Tull,Human,78,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Roseth Danelle,Half-elf,73,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Verris Cott,Human,77,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Ysolde Trask,Human,81,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Derrin Karr,Half-elf,83,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Ophira Lanneth,Half-elf,79,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Berrick Dorrin,Half-elf,73,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Liora Navesh,Half-elf,60,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Hadric Ponn,Half-elf,56,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Cenra Vallis,Human,64,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Torin Eldewin,Half-elf,61,Villager (retired/aging),Present,Elder resident in a poorly maintained home; wary of outsiders.
Matthias Holloway,Human,45,Carpenter / laborer,Present,"Proud, skilled joiner; bristles at mistreatment; family head."
Mrs. Holloway,Human,35,Homemaker,Present,Keeps family together; quieter than Matthias.
Holloway Children (3),Human,9,Children,Present,"Rowdy, disruptive; often near Valenna's docks."
Tobren Veylinor,Human,55,Displaced noble,Present,"Arrogant, claimed a cottage, pushes for 'noble alliance'."
Alara Veylinor,Human,22,Aspiring archer,Present,Striking young woman; agitates guards; morale collapses in danger.
Nema Ferrin,Human,28,Gardener / herbalist,Present,"Practical, wants to cultivate land, pushes for hut/garden space."
Palia Ferrin,Human,28,Forager / poulticer,Present,"Collects herbs/fungi, offers healing brews, too close to the Mire."
Corven Hald,Human,42,Ex-Guard Captain,Present,"Fighter 3; square-jawed, scarred; commands 3 soldiers."
Red Mallis,Human,35,Fighter / agitator,Present,Fighter 2; fox-faced troublemaker; Corven's right hand.
Darric,Human,25,Man-at-arms,Present,Broad-shouldered soldier; loyal but slow; follows Corven.
Oren,Human,25,Man-at-arms,Present,"Gaunt, scarred chin; restless; follows Red's lead."
Lysa Dorn,Human,35,Mother / refugee,Present,Lives in patched tent; whispers of curses; fears Shadowmire spirits.
Kier Dorn,Human,10,Child,Present,"Pale, sickly, night terrors; claims visions of Shadowmire."
Dorn Aunt (unnamed),Human,70,Widow,Present,Silent elder; helps with Kier; feared by villagers.
Davi,Half-orc,66,Laborer,Present,"Stoic, blamed for thefts; keeps to himself."
Merra,Half-orc,66,Laborer (hauler),Present,Works hauling timber and water; target of prejudice.`
    
    const lines = csvData.trim().split('\n')
    const headers = lines[0].split(',')
    const data = lines.slice(1).map(line => {
      const values = line.split(',')
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index]?.trim() || ''
      })
      return obj
    })
    
    console.log(`Parsed ${data.length} residents from CSV`)
    
    // Import residents
    const importedResidents = []
    for (const resident of data) {
      if (resident.Name && resident.Name.trim()) {
        const person = await prismaWithEnv.person.create({
          data: {
            name: resident.Name,
            species: resident.Race,
            age: resident.Age ? parseInt(resident.Age) : null,
            occupation: resident.Occupation || null,
            notes: resident.Notes || null,
            tags: resident.Presence === 'Present' ? 'present' : 'absent',
            livesAtId: locations['Deer River'].id, // Default to main town
            worksAtId: extractWorkLocation(resident.Occupation, locations)
          }
        })
        importedResidents.push(person)
      }
    }
    
    await prismaWithEnv.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${importedResidents.length} residents`,
      importedCount: importedResidents.length,
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
  const locations = {
    'Deer River': await prisma.location.upsert({
      where: { name: 'Deer River' },
      update: {},
      create: {
        name: 'Deer River',
        kind: 'Town',
        address: 'Main settlement',
        notes: 'The main town of Deer River'
      }
    }),
    'Rusty Pike Inn': await prisma.location.upsert({
      where: { name: 'Rusty Pike Inn' },
      update: {},
      create: {
        name: 'Rusty Pike Inn',
        kind: 'Business',
        address: 'Main street',
        notes: 'Tavern and inn run by Rurik Copperpot'
      }
    }),
    'Forge of Fortune': await prisma.location.upsert({
      where: { name: 'Forge of Fortune' },
      update: {},
      create: {
        name: 'Forge of Fortune',
        kind: 'Business',
        address: 'Blacksmith district',
        notes: 'Blacksmith shop run by Oswin Finch'
      }
    }),
    'River\'s Edge Goods': await prisma.location.upsert({
      where: { name: 'River\'s Edge Goods' },
      update: {},
      create: {
        name: 'River\'s Edge Goods',
        kind: 'Business',
        address: 'Market square',
        notes: 'General goods shop run by Torrin'
      }
    }),
    'Ironclad Armory': await prisma.location.upsert({
      where: { name: 'Ironclad Armory' },
      update: {},
      create: {
        name: 'Ironclad Armory',
        kind: 'Business',
        address: 'Armor district',
        notes: 'Armor shop run by Eamon Hargrove'
      }
    }),
    'Marina': await prisma.location.upsert({
      where: { name: 'Marina' },
      update: {},
      create: {
        name: 'Marina',
        kind: 'Dock',
        address: 'Lustrous Run',
        notes: 'Ferry dock managed by Valenna Moondancer'
      }
    })
  }
  return locations
}

async function createBasicFactions(prisma: PrismaClient) {
  const factions = {
    'Town Council': await prisma.faction.upsert({
      where: { name: 'Town Council' },
      update: {},
      create: {
        name: 'Town Council',
        description: 'Governing body of Deer River',
        color: '#4A90E2'
      }
    }),
    'Guard': await prisma.faction.upsert({
      where: { name: 'Guard' },
      update: {},
      create: {
        name: 'Guard',
        description: 'Town guard and security',
        color: '#E24A4A'
      }
    }),
    'Merchants': await prisma.faction.upsert({
      where: { name: 'Merchants' },
      update: {},
      create: {
        name: 'Merchants',
        description: 'Business owners and traders',
        color: '#4AE24A'
      }
    }),
    'Refugees': await prisma.faction.upsert({
      where: { name: 'Refugees' },
      update: {},
      create: {
        name: 'Refugees',
        description: 'Displaced people seeking shelter',
        color: '#E2E24A'
      }
    })
  }
  return factions
}

function extractWorkLocation(occupation: string, locations: any) {
  if (occupation.includes('Rusty Pike')) return locations['Rusty Pike Inn']?.id
  if (occupation.includes('Forge of Fortune')) return locations['Forge of Fortune']?.id
  if (occupation.includes('River\'s Edge')) return locations['River\'s Edge Goods']?.id
  if (occupation.includes('Ironclad Armory')) return locations['Ironclad Armory']?.id
  if (occupation.includes('Ferrymaster') || occupation.includes('Marina')) return locations['Marina']?.id
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
