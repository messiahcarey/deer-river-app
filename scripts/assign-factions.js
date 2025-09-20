#!/usr/bin/env node

/**
 * Script to assign faction memberships to villagers
 */

const BASE_URL = 'https://main.d25mi5h1ems0sj.amplifyapp.com';

const ORIGINAL_RESIDENTS_FACTION_ID = 'cmfoo7pkn0000kz1xj5ilrrmo';

// List of villager IDs from the previous output
const VILLAGER_IDS = [
  'cmfnigrsr0015l41pwk7w55mb', // Ansel Drowick
  'cmfnigrtt001tl41pthneaq03', // Berrick Dorrin
  'cmfnigru2001zl41pnw3njhxe', // Cenra Vallis
  'cmfnigrs4000xl41pe7yqpxtb', // Coren Duthane
  'cmfnigrtn001pl41pad4ecm8t', // Derrin Karr
  'cmfnigrt3001dl41pe4sategm', // Edric Vane
  'cmfnigrsx0019l41pbhdu18hb', // Garrin Moat
  'cmfnigrtz001xl41paw64qcge', // Hadric Ponn
  'cmfnigrt9001hl41pseqcxr66', // Harwin Tull
  'cmfnigrso0013l41p7srvcdqi', // Helvi Thorne
  'cmfnigrs0000vl41p3xzg6r2a', // Ivor Hemsley
  'cmfnigrtw001vl41ppjcsjoql', // Liora Navesh
  'cmfnigrs7000zl41p2v1nr167', // Marella Brightrun
  'cmfnigrt7001fl41phq2xjmkn', // Milna Carrow
  'cmfnigrsk0011l41p8e2bso62', // Odran Pell
  'cmfnigrtq001rl41p9zlrai57', // Ophira Lanneth
  'cmfnigrsu0017l41pcwfs1vxr', // Petra Kells
  'cmfnigrtc001jl41pls40finm', // Roseth Danelle
  'cmfnigrt0001bl41p55kvj0cc', // Selda Farrow
  'cmfnigrrr000tl41pz36qgxjw', // Tomasin Grell
  'cmfnigru80021l41pmmqqtwfj', // Torin Eldewin
  'cmfnigrtf001ll41pbq5bqoce', // Verris Cott
  'cmfnigrth001nl41pnzvn83up'  // Ysolde Trask
];

async function createFactionMembership(personId, factionId) {
  console.log(`  Creating faction membership for person ${personId}...`);
  
  const response = await fetch(`${BASE_URL}/api/memberships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personId,
      factionId,
      role: 'member',
      isPrimary: true,
      alignment: 75,
      openness: 60,
      notes: 'Original resident of Deer River'
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`  ❌ Error: ${data.error || 'Unknown error'}`);
    return false;
  }
  
  console.log(`  ✅ Success: ${data.data.faction.name}`);
  return true;
}

async function assignFactions() {
  console.log('🏛️ Assigning villagers to "Original Residents" faction...');
  console.log(`📊 Processing ${VILLAGER_IDS.length} villagers...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < VILLAGER_IDS.length; i++) {
    const personId = VILLAGER_IDS[i];
    console.log(`\n📝 [${i + 1}/${VILLAGER_IDS.length}] Processing person ${personId}...`);
    
    try {
      const success = await createFactionMembership(personId, ORIGINAL_RESIDENTS_FACTION_ID);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error:`, error.message);
      errorCount++;
    }
    
    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Results:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log(`  📈 Total: ${VILLAGER_IDS.length}`);
  
  if (successCount > 0) {
    console.log('\n🎉 Faction assignments completed!');
  }
}

// Run the script
if (require.main === module) {
  assignFactions()
    .then(() => {
      console.log('✅ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { assignFactions };
