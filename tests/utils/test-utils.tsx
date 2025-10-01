import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
}

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data factories
export const createMockPerson = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  species: 'Human',
  occupation: 'Blacksmith',
  status: 'present',
  livesAtId: 'loc1',
  worksAtId: 'loc2',
  householdId: 'house1',
  household: { id: 'house1', name: 'Doe Family' },
  memberships: [
    {
      id: 'mem1',
      factionId: 'faction1',
      faction: { id: 'faction1', name: 'Merchants', color: '#4AE24A' },
      role: 'Member',
      isPrimary: true,
    },
  ],
  ...overrides,
})

export const createMockFaction = (overrides = {}) => ({
  id: '1',
  name: 'Merchants',
  description: 'A guild of traders and merchants',
  color: '#4AE24A',
  motto: 'Trade and prosper',
  members: [],
  ...overrides,
})

export const createMockLocation = (overrides = {}) => ({
  id: '1',
  name: 'The Rusty Pike Inn',
  type: 'tavern',
  description: 'A cozy tavern in the center of town',
  capacity: 20,
  x: 100,
  y: 100,
  residents: [],
  workers: [],
  ...overrides,
})

export const createMockDashboardData = (overrides = {}) => ({
  summary: {
    totalPeople: 48,
    totalFactions: 7,
    totalLocations: 45,
    totalMemberships: 53,
    peopleWithoutHomes: 0,
    peopleWithoutWork: 32,
    peopleWithoutFaction: 7,
  },
  distributions: {
    factions: [
      { factionId: '1', factionName: 'Original Residents', color: '#3b82f6', count: 36 },
      { factionId: '2', factionName: 'Merchants', color: '#4AE24A', count: 6 },
    ],
    species: [
      { species: 'Human', count: 31 },
      { species: 'Half-elf', count: 14 },
    ],
    occupations: [
      { occupation: 'Villager (retired/aging)', count: 23 },
      { occupation: 'Man-at-arms', count: 2 },
    ],
  },
  ...overrides,
})

// Mock API responses
export const mockApiResponses = {
  dashboard: {
    success: true,
    data: createMockDashboardData(),
  },
  people: [createMockPerson()],
  factions: [createMockFaction()],
  locations: [createMockLocation()],
}

// Test helpers
export const waitForLoadingToFinish = async () => {
  // Wait for any loading indicators to disappear
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const mockFetch = (response: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  })
}

export const mockFetchError = (error: string) => {
  global.fetch = jest.fn().mockRejectedValue(new Error(error))
}
