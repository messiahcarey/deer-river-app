import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'

// Mock the dashboard API
global.fetch = jest.fn()

const mockDashboardData = {
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
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockDashboardData }),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard with loading state initially', () => {
    render(<Dashboard />)
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('renders dashboard data after loading', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('48')).toBeInTheDocument() // Total people
      expect(screen.getByText('7')).toBeInTheDocument() // Total factions
      expect(screen.getByText('45')).toBeInTheDocument() // Total locations
    })
  })

  it('displays faction distribution', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Original Residents')).toBeInTheDocument()
      expect(screen.getByText('Merchants')).toBeInTheDocument()
    })
  })

  it('displays species distribution', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Human')).toBeInTheDocument()
      expect(screen.getByText('Half-elf')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/)).toBeInTheDocument()
    })
  })

  it('shows retry button on error', async () => {
    ;(fetch as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })
  })
})
