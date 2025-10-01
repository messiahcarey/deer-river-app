import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads the homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the main title is visible
    await expect(page.getByText('🏰 Deer River')).toBeVisible()
    await expect(page.getByText('Fantasy Town Population Manager')).toBeVisible()
  })

  test('displays workflow templates section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('⚡ Workflow Templates')).toBeVisible()
    await expect(page.getByText('Quick actions for common tasks')).toBeVisible()
  })

  test('shows all workflow cards', async ({ page }) => {
    await page.goto('/')
    
    // Check for all workflow cards
    await expect(page.getByText('New Refugee Family')).toBeVisible()
    await expect(page.getByText('New Merchant Guild')).toBeVisible()
    await expect(page.getByText('New Tavern')).toBeVisible()
    await expect(page.getByText('Bulk Assign Housing')).toBeVisible()
    await expect(page.getByText('Bulk Faction Assignment')).toBeVisible()
    await expect(page.getByText('New Noble House')).toBeVisible()
    await expect(page.getByText('New Temple')).toBeVisible()
    await expect(page.getByText('Bulk Status Update')).toBeVisible()
  })

  test('displays navigation cards', async ({ page }) => {
    await page.goto('/')
    
    // Check for main navigation cards
    await expect(page.getByText('👥 People')).toBeVisible()
    await expect(page.getByText('🏛️ Factions')).toBeVisible()
    await expect(page.getByText('🗺️ Map')).toBeVisible()
    await expect(page.getByText('💰 Resources')).toBeVisible()
    await expect(page.getByText('📊 Analytics')).toBeVisible()
    await expect(page.getByText('📝 Events')).toBeVisible()
  })

  test('navigates to people page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('👥 People').click()
    await expect(page).toHaveURL('/people')
  })

  test('navigates to factions page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('🏛️ Factions').click()
    await expect(page).toHaveURL('/factions')
  })

  test('navigates to map page', async ({ page }) => {
    await page.goto('/')
    
    await page.getByText('🗺️ Map').click()
    await expect(page).toHaveURL('/map')
  })

  test('shows workflow statistics', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('8 Total Templates')).toBeVisible()
    await expect(page.getByText('2 People Workflows')).toBeVisible()
    await expect(page.getByText('3 Bulk Operations')).toBeVisible()
    await expect(page.getByText('7 min Avg. Time Saved')).toBeVisible()
  })

  test('displays category tabs', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('All Templates')).toBeVisible()
    await expect(page.getByText('People')).toBeVisible()
    await expect(page.getByText('Factions')).toBeVisible()
    await expect(page.getByText('Buildings')).toBeVisible()
    await expect(page.getByText('⚡ Bulk Operations')).toBeVisible()
  })
})
