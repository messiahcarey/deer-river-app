import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function cleanupDuplicateBuildings() {
  try {
    console.log('🔍 Finding duplicate buildings...')
    
    // Find buildings with duplicate names
    const duplicates = await prisma.$queryRaw`
      SELECT name, COUNT(*) as count
      FROM "Location"
      GROUP BY name
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `
    
    console.log(`Found ${duplicates.length} duplicate building names:`)
    duplicates.forEach(dup => {
      console.log(`  - ${dup.name}: ${dup.count} copies`)
    })
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!')
      return
    }
    
    // For each duplicate group, keep the first one and delete the rest
    for (const duplicate of duplicates) {
      console.log(`\n🧹 Cleaning up duplicates for "${duplicate.name}"...`)
      
      // Get all buildings with this name
      const buildings = await prisma.location.findMany({
        where: { name: duplicate.name },
        include: {
          residents: true,
          workers: true
        },
        orderBy: { id: 'asc' } // Keep the first one (oldest)
      })
      
      if (buildings.length <= 1) continue
      
      const keepBuilding = buildings[0] // Keep the first one
      const deleteBuildings = buildings.slice(1) // Delete the rest
      
      console.log(`  Keeping building ID: ${keepBuilding.id}`)
      console.log(`  Deleting ${deleteBuildings.length} duplicates...`)
      
      for (const building of deleteBuildings) {
        // Check if building has residents or workers
        if (building.residents.length > 0 || building.workers.length > 0) {
          console.log(`  ⚠️  Skipping building ${building.id} - has ${building.residents.length} residents and ${building.workers.length} workers`)
          continue
        }
        
        // Delete the duplicate
        await prisma.location.delete({
          where: { id: building.id }
        })
        console.log(`  ✅ Deleted duplicate building ${building.id}`)
      }
    }
    
    console.log('\n🎉 Cleanup complete!')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDuplicateBuildings()
