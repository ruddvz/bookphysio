import { test, expect } from '@playwright/test'

test.describe('Provider Earnings Flow', () => {
  test('provider can view summary stats and transactions', async ({ page }) => {
    // Navigate
    await page.goto('/provider/earnings')
    
    // Check header
    await expect(page.locator('h1')).toContainText('Earnings & Payouts')
    
    // Check summary cards
    await expect(page.locator('text=₹5300')).toBeVisible()
    await expect(page.locator('text=₹954')).toBeVisible()
    await expect(page.locator('text=₹4500')).toBeVisible()
    
    // Check transactions
    await expect(page.locator('text=Rahul Sharma')).toBeVisible()
    await expect(page.locator('text=₹656')).toBeVisible()
    await expect(page.locator('text=Paid').first()).toBeVisible()
    
    // Check chart placeholder
    await expect(page.locator('text=Revenue Growth')).toBeVisible()
    await expect(page.locator('text=COMING SOON')).toBeHidden() // Hover logic
    
    // Hover over chart to see "Coming soon"
    await page.hover('text=Revenue Growth')
    await expect(page.locator('text=COMING SOON')).toBeVisible()
  })
})
