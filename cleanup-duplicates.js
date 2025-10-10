import { PrismaClient } from '@prisma/client'

async function cleanupDuplicates() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Starting duplicate membership cleanup...')
    
    // Find all active memberships
    const allMemberships = await prisma.personFactionMembership.findMany({
      where: {
        leftAt: null // Only active memberships
      },
      include: {
        person: {
          select: { name: true }
        },
        faction: {
          select: { name: true }
        }
      }
    })

    console.log(`Found ${allMemberships.length} active memberships`)

    // Group by personId and factionId to find duplicates
    const membershipGroups = new Map()
    
    allMemberships.forEach(membership => {
      const key = `${membership.personId}-${membership.factionId}`
      if (!membershipGroups.has(key)) {
        membershipGroups.set(key, [])
      }
      membershipGroups.get(key).push(membership)
    })

    const duplicates = Array.from(membershipGroups.entries())
      .filter(([_, memberships]) => memberships.length > 1)

    console.log(`Found ${duplicates.length} duplicate membership groups`)

    let totalRemoved = 0

    for (const [key, memberships] of duplicates) {
      const [personId, factionId] = key.split('-')
      const personName = memberships[0].person.name
      const factionName = memberships[0].faction.name
      
      console.log(`Cleaning up duplicates for ${personName} -> ${factionName} (${memberships.length} duplicates)`)

      // Keep the most recent one (highest ID) and mark others as left
      const sortedMemberships = memberships.sort((a, b) => b.id.localeCompare(a.id))
      const keepMembership = sortedMemberships[0]
      const removeMemberships = sortedMemberships.slice(1)

      // Mark the older ones as left
      for (const membership of removeMemberships) {
        await prisma.personFactionMembership.update({
          where: { id: membership.id },
          data: { 
            leftAt: new Date(),
            notes: membership.notes ? `${membership.notes} (Removed duplicate)` : 'Removed duplicate'
          }
        })
        totalRemoved++
      }
    }

    console.log(`Cleanup complete! Removed ${totalRemoved} duplicate memberships`)
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDuplicates()
