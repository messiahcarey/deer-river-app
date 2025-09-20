#!/usr/bin/env node

/**
 * Bulk update script for villagers with "Villager (retired/aging)" occupation
 * - Sets worksAtId to null (no workplace)
 * - Sets faction to "Original Residents"
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const ORIGINAL_RESIDENTS_FACTION_ID = 'cmfoo7pkn0000kz1xj5ilrrmo';

async function updateVillagers() {
  try {
    console.log('🔍 Finding villagers with "Villager (retired/aging)" occupation...');
    
    // Find all people with the specific occupation
    const villagers = await prisma.person.findMany({
      where: {
        occupation: 'Villager (retired/aging)'
      },
      select: {
        id: true,
        name: true,
        occupation: true,
        worksAtId: true,
        faction: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`📊 Found ${villagers.length} villagers to update:`);
    villagers.forEach(villager => {
      console.log(`  - ${villager.name} (ID: ${villager.id})`);
      console.log(`    Current workplace: ${villager.worksAtId ? 'Has workplace' : 'None'}`);
      console.log(`    Current faction: ${villager.faction?.name || 'None'}`);
    });

    if (villagers.length === 0) {
      console.log('✅ No villagers found to update.');
      return;
    }

    console.log('\n🔄 Updating villagers...');

    // Update each villager
    const updatePromises = villagers.map(villager => 
      prisma.person.update({
        where: { id: villager.id },
        data: {
          worksAtId: null, // Remove workplace
          // Note: We'll handle faction assignment separately since it's a relationship
        }
      })
    );

    await Promise.all(updatePromises);
    console.log('✅ Updated workplace assignments (set to null)');

    // Now handle faction assignments
    console.log('🏛️ Assigning to "Original Residents" faction...');
    
    const factionAssignments = villagers.map(villager => 
      prisma.personFactionMembership.upsert({
        where: {
          personId_factionId: {
            personId: villager.id,
            factionId: ORIGINAL_RESIDENTS_FACTION_ID
          }
        },
        update: {
          // Update existing membership
          role: 'member',
          isPrimary: true,
          alignment: 75, // High alignment with their own faction
          openness: 60,
          notes: 'Original resident of Deer River'
        },
        create: {
          personId: villager.id,
          factionId: ORIGINAL_RESIDENTS_FACTION_ID,
          role: 'member',
          isPrimary: true,
          alignment: 75,
          openness: 60,
          notes: 'Original resident of Deer River'
        }
      })
    );

    await Promise.all(factionAssignments);
    console.log('✅ Assigned to "Original Residents" faction');

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedVillagers = await prisma.person.findMany({
      where: {
        occupation: 'Villager (retired/aging)'
      },
      select: {
        id: true,
        name: true,
        worksAtId: true,
        memberships: {
          where: {
            factionId: ORIGINAL_RESIDENTS_FACTION_ID,
            leftAt: null // Active memberships only
          },
          select: {
            faction: {
              select: {
                name: true
              }
            },
            role: true,
            isPrimary: true
          }
        }
      }
    });

    console.log('\n📋 Updated villagers:');
    updatedVillagers.forEach(villager => {
      const factionMembership = villager.memberships[0];
      console.log(`  - ${villager.name}`);
      console.log(`    Workplace: ${villager.worksAtId ? 'Has workplace' : 'None ✅'}`);
      console.log(`    Faction: ${factionMembership ? `${factionMembership.faction.name} (${factionMembership.role}) ✅` : 'Not assigned ❌'}`);
    });

    console.log('\n🎉 Bulk update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating villagers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  updateVillagers()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateVillagers };
