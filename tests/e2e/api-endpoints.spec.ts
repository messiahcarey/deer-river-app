import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('dashboard API returns valid data', async ({ request }) => {
    const response = await request.get('/api/dashboard')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    expect(data.data.summary).toBeDefined()
    expect(data.data.distributions).toBeDefined()
  })

  test('people API returns valid data', async ({ request }) => {
    const response = await request.get('/api/people')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('factions API returns valid data', async ({ request }) => {
    const response = await request.get('/api/factions')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('locations API returns valid data', async ({ request }) => {
    const response = await request.get('/api/locations')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('health API returns success', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('db-status API returns database information', async ({ request }) => {
    const response = await request.get('/api/db-status')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
  })

  test('handles invalid API endpoints gracefully', async ({ request }) => {
    const response = await request.get('/api/nonexistent')
    expect(response.status()).toBe(404)
  })

  test('dashboard API handles errors gracefully', async ({ request }) => {
    // This test would need to mock database errors
    const response = await request.get('/api/dashboard')
    expect(response.status()).toBeLessThan(500)
  })
})
