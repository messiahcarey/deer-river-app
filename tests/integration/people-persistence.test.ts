import { test, expect } from '@playwright/test'

test.describe('People Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/people')
    await page.waitForLoadState('networkidle')
  })

  test('should save faction changes correctly', async ({ page }) => {
    // Find first person with edit button
    const editButton = page.locator('button:has-text("Edit")').first()
    await editButton.click()

    // Wait for modal to open
    await page.waitForSelector('[data-testid="person-edit-modal"]')

    // Get initial faction count
    const initialFactions = await page.locator('input[type="checkbox"]:checked').count()

    // Toggle a faction
    const factionCheckbox = page.locator('input[type="checkbox"]').first()
    await factionCheckbox.click()

    // Save changes
    await page.locator('button:has-text("Save Changes")').click()
    await page.waitForLoadState('networkidle')

    // Verify changes persisted
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check that faction changes are visible
    const updatedFactions = await page.locator('input[type="checkbox"]:checked').count()
    expect(updatedFactions).not.toBe(initialFactions)
  })

  test('should save age changes correctly', async ({ page }) => {
    // Find first person with edit button
    const editButton = page.locator('button:has-text("Edit")').first()
    await editButton.click()

    // Wait for modal to open
    await page.waitForSelector('[data-testid="person-edit-modal"]')

    // Change age
    const ageInput = page.locator('input[type="number"]')
    await ageInput.fill('25')

    // Save changes
    await page.locator('button:has-text("Save Changes")').click()
    await page.waitForLoadState('networkidle')

    // Verify age persisted
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check that age is displayed correctly
    const ageDisplay = page.locator('td:has-text("25")').first()
    await expect(ageDisplay).toBeVisible()
  })

  test('should handle multiple faction changes', async ({ page }) => {
    // Find first person with edit button
    const editButton = page.locator('button:has-text("Edit")').first()
    await editButton.click()

    // Wait for modal to open
    await page.waitForSelector('[data-testid="person-edit-modal"]')

    // Select multiple factions
    const factionCheckboxes = page.locator('input[type="checkbox"]')
    const count = await factionCheckboxes.count()
    
    // Select first 3 factions
    for (let i = 0; i < Math.min(3, count); i++) {
      await factionCheckboxes.nth(i).check()
    }

    // Save changes
    await page.locator('button:has-text("Save Changes")').click()
    await page.waitForLoadState('networkidle')

    // Verify multiple factions persisted
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Check that multiple faction badges are visible
    const factionBadges = page.locator('[class*="bg-"]:has-text("(P)")')
    await expect(factionBadges).toHaveCount(1) // Should have one primary faction
  })
})
