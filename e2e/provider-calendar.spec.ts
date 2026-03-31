import { test, expect } from '@playwright/test'

test.describe('Provider Calendar Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the provider calendar page
    await page.goto('/provider/calendar')
  })

  test('provider can view 7-day calendar and navigation controls', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /calendar/i })).toBeVisible()

    // 7 day headers should be visible
    const dayHeaders = page.locator('div:has-text("MON"), div:has-text("TUE"), div:has-text("WED")')
    await expect(dayHeaders.first()).toBeVisible()

    // Navigation buttons
    await expect(page.getByLabel('Previous week')).toBeVisible()
    await expect(page.getByLabel('Next week')).toBeVisible()
    
    // Manage Availability link
    await expect(page.getByRole('link', { name: /manage availability/i })).toBeVisible()
  })

  test('calendar grid contains time slots', async ({ page }) => {
    // Check for the presence of slot cells (any cell with h-14)
    const slot = page.locator('.h-14').first()
    await expect(slot).toBeVisible({ timeout: 10000 })
  })
})
