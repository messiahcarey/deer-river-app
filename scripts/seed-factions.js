import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const factions = [
  {
    id: 'faction_town_council',
    name: 'Town Council',
    motto: 'Order and Prosperity',
    description: 'The governing body of Deer River, responsible for maintaining law and order',
    color: '#1e40af'
  },
  {
    id: 'faction_merchants',
    name: 'Merchant Guild',
    motto: 'Gold Flows Like Water',
    description: 'Traders and shopkeepers who control the town\'s commerce',
    color: '#f59e0b'
  },
  {
    id: 'faction_artisans',
    name: 'Artisan Collective',
    motto: 'Craftsmanship Above All',
    description: 'Skilled craftspeople including blacksmiths, carpenters, and other trades',
    color: '#dc2626'
  },
  {
    id: 'faction_temple',
    name: 'Temple of Light',
    motto: 'In Light We Trust',
    description: 'Religious order dedicated to spreading divine light and wisdom',
    color: '#fbbf24'
  },
  {
    id: 'faction_farmers',
    name: 'Agricultural Society',
    motto: 'From Earth We Rise',
    description: 'Farmers and agricultural workers who feed the town',
    color: '#16a34a'
  },
  {
    id: 'faction_adventurers',
    name: 'Adventurer\'s Guild',
    motto: 'Fortune Favors the Bold',
    description: 'Mercenaries, explorers, and those who seek adventure',
    color: '#7c3aed'
  }
]

async function seedFactions() {
  try {
    console.log('Seeding factions...')
    
    for (const faction of factions) {
      await prisma.faction.upsert({
        where: { id: faction.id },
        update: faction,
        create: faction
      })
      console.log(`✓ Seeded faction: ${faction.name}`)
    }
    
    console.log('✅ Faction seeding completed!')
  } catch (error) {
    console.error('❌ Error seeding factions:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedFactions()
