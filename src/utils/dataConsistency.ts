interface Person {
  id: string
  name: string
  species: string
  age: number | null
  memberships?: Array<{
    id: string
    faction: {
      id: string
      name: string
      color: string | null
    }
    isPrimary: boolean
  }>
}

export function checkDataConsistency(people: Person[]): {
  isConsistent: boolean
  issues: string[]
} {
  const issues: string[] = []

  // Check for duplicate IDs
  const ids = people.map(p => p.id)
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index)
  if (duplicateIds.length > 0) {
    issues.push(`Duplicate person IDs found: ${duplicateIds.join(', ')}`)
  }

  // Check for missing required fields
  people.forEach((person, index) => {
    if (!person.name || person.name.trim() === '') {
      issues.push(`Person ${index + 1}: Missing name`)
    }
    if (!person.species || person.species.trim() === '') {
      issues.push(`Person ${index + 1}: Missing species`)
    }
    if (person.age !== null && (typeof person.age !== 'number' || person.age < 0 || person.age > 1000)) {
      issues.push(`Person ${index + 1}: Invalid age (${person.age})`)
    }
  })

  // Check faction membership consistency
  people.forEach((person, index) => {
    if (person.memberships) {
      const primaryMemberships = person.memberships.filter(m => m.isPrimary)
      if (primaryMemberships.length > 1) {
        issues.push(`Person ${index + 1}: Multiple primary factions`)
      }
      
      // Check for duplicate faction memberships
      const factionIds = person.memberships.map(m => m.faction.id)
      const duplicateFactions = factionIds.filter((id, i) => factionIds.indexOf(id) !== i)
      if (duplicateFactions.length > 0) {
        issues.push(`Person ${index + 1}: Duplicate faction memberships`)
      }
    }
  })

  return {
    isConsistent: issues.length === 0,
    issues
  }
}

export function logDataConsistency(people: Person[]) {
  const { isConsistent, issues } = checkDataConsistency(people)
  
  if (isConsistent) {
    console.log('✅ Data consistency check passed')
  } else {
    console.warn('⚠️ Data consistency issues found:', issues)
  }
  
  return { isConsistent, issues }
}
