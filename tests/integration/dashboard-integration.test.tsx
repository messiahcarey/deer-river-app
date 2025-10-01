import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import Dashboard from '@/components/Dashboard'

// Mock API server
const server = setupServer(
  rest.get('/api/dashboard', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
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
        },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Dashboard Integration', () => {
  it('loads and displays dashboard data from API', async () => {
    render(<Dashboard />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument()
    })
    
    // Check that data is displayed
    expect(screen.getByText('48')).toBeInTheDocument() // Total people
    expect(screen.getByText('7')).toBeInTheDocument() // Total factions
    expect(screen.getByText('45')).toBeInTheDocument() // Total locations
  })

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/dashboard', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }))
      })
    )

    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/)).toBeInTheDocument()
    })
    
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('retries on error when retry button is clicked', async () => {
    let requestCount = 0
    server.use(
      rest.get('/api/dashboard', (req, res, ctx) => {
        requestCount++
        if (requestCount === 1) {
          return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }))
        }
        return res(
          ctx.json({
            success: true,
            data: {
              summary: { totalPeople: 48, totalFactions: 7, totalLocations: 45, totalMemberships: 53, peopleWithoutHomes: 0, peopleWithoutWork: 32, peopleWithoutFaction: 7 },
              distributions: { factions: [], species: [], occupations: [] },
            },
          })
        )
      })
    )

    render(<Dashboard />)
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard/)).toBeInTheDocument()
    })
    
    // Click retry
    const retryButton = screen.getByText('Retry')
    retryButton.click()
    
    // Wait for success
    await waitFor(() => {
      expect(screen.getByText('48')).toBeInTheDocument()
    })
    
    expect(requestCount).toBe(2)
  })
})
