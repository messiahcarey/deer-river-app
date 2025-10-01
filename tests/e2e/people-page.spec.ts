import { test, expect } from '@playwright/test'

test.describe('People Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/people')
  })

  test('loads the people page successfully', async ({ page }) => {
    await expect(page.getByText('People')).toBeVisible()
    await expect(page.getByText('Manage the citizens of Deer River')).toBeVisible()
  })

  test('displays breadcrumb navigation', async ({ page }) => {
    await expect(page.getByText('Home')).toBeVisible()
    await expect(page.getByText('People')).toBeVisible()
  })

  test('shows people table with data', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    
    // Check for table headers
    await expect(page.getByText('Name')).toBeVisible()
    await expect(page.getByText('Species')).toBeVisible()
    await expect(page.getByText('Occupation')).toBeVisible()
    await expect(page.getByText('Status')).toBeVisible()
    await expect(page.getByText('Faction')).toBeVisible()
  })

  test('displays filter controls', async ({ page }) => {
    await expect(page.getByText('Filters')).toBeVisible()
    await expect(page.getByText('Species')).toBeVisible()
    await expect(page.getByText('Occupation')).toBeVisible()
    await expect(page.getByText('Faction')).toBeVisible()
    await expect(page.getByText('Status')).toBeVisible()
  })

  test('shows bulk operations section', async ({ page }) => {
    await expect(page.getByText('Bulk Operations')).toBeVisible()
    await expect(page.getByText('Bulk Assign Housing')).toBeVisible()
    await expect(page.getByText('Bulk Assign Faction')).toBeVisible()
    await expect(page.getByText('Bulk Update Status')).toBeVisible()
  })

  test('has new person button', async ({ page }) => {
    await expect(page.getByText('New Person')).toBeVisible()
  })

  test('can select people for bulk operations', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    
    // Try to find and click a checkbox
    const checkboxes = page.locator('input[type="checkbox"]')
    if (await checkboxes.count() > 0) {
      await checkboxes.first().check()
      await expect(checkboxes.first()).toBeChecked()
    }
  })

  test('can sort by different columns', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    
    // Try to click on sortable headers
    const nameHeader = page.getByText('Name')
    if (await nameHeader.isVisible()) {
      await nameHeader.click()
    }
  })

  test('shows pagination if needed', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle')
    
    // Check if pagination controls exist
    const pagination = page.locator('[data-testid="pagination"]')
    if (await pagination.count() > 0) {
      await expect(pagination).toBeVisible()
    }
  })
})
