#!/usr/bin/env node

/**
 * Bulk update script for villagers using API endpoints
 * - Sets worksAtId to null (no workplace) 
 * - Sets faction to "Original Residents"
 */

const BASE_URL = 'https://main.d25mi5h1ems0sj.amplifyapp.com';

const ORIGINAL_RESIDENTS_FACTION_ID = 'cmfoo7pkn0000kz1xj5ilrrmo';

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function updatePerson(personId, data) {
  const response = await fetch(`${BASE_URL}/api/people/${personId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

async function createFactionMembership(personId, factionId, role = 'member', isPrimary = true) {
  const response = await fetch(`${BASE_URL}/api/memberships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personId,
      factionId,
      role,
      isPrimary,
      alignment: 75,
      openness: 60,
      notes: 'Original resident of Deer River'
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

async function updateVillagers() {
  try {
    console.log('🔍 Fetching people data...');
    
    // Get all people
    const peopleResponse = await fetchData(`${BASE_URL}/api/people`);
    const people = peopleResponse.data;
    
    // Filter for villagers with "Villager (retired/aging)" occupation
    const villagers = people.filter(person => 
      person.occupation === 'Villager (retired/aging)'
    );
    
    console.log(`📊 Found ${villagers.length} villagers to update:`);
    villagers.forEach(villager => {
      console.log(`  - ${villager.name} (ID: ${villager.id})`);
      console.log(`    Current workplace: ${villager.worksAt ? villager.worksAt.name : 'None'}`);
      console.log(`    Current faction: ${villager.faction?.name || 'None'}`);
    });

    if (villagers.length === 0) {
      console.log('✅ No villagers found to update.');
      return;
    }

    console.log('\n🔄 Updating villagers...');

    // Update each villager
    for (const villager of villagers) {
      console.log(`\n📝 Updating ${villager.name}...`);
      
      try {
        // Update person to remove workplace
        await updatePerson(villager.id, {
          worksAtId: null
        });
        console.log(`  ✅ Removed workplace`);
        
        // Add faction membership
        await createFactionMembership(villager.id, ORIGINAL_RESIDENTS_FACTION_ID);
        console.log(`  ✅ Added to Original Residents faction`);
        
      } catch (error) {
        console.error(`  ❌ Error updating ${villager.name}:`, error.message);
      }
    }

    console.log('\n🔍 Verifying updates...');
    
    // Fetch updated data to verify
    const updatedPeopleResponse = await fetchData(`${BASE_URL}/api/people`);
    const updatedPeople = updatedPeopleResponse.data;
    const updatedVillagers = updatedPeople.filter(person => 
      person.occupation === 'Villager (retired/aging)'
    );

    console.log('\n📋 Updated villagers:');
    for (const villager of updatedVillagers) {
      console.log(`  - ${villager.name}`);
      console.log(`    Workplace: ${villager.worksAt ? villager.worksAt.name : 'None ✅'}`);
      console.log(`    Faction: ${villager.faction?.name || 'Not assigned ❌'}`);
    }

    console.log('\n🎉 Bulk update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating villagers:', error);
    throw error;
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
