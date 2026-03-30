import { test, expect } from '@playwright/test'

test.describe('Specialty & City Landing Pages', () => {
  test('specialty page renders correct content and title', async ({ page }) => {
    await page.goto('/specialty/sports-physio')
    await expect(page.locator('h1')).toContainText('Sports Physiotherapists')
    await expect(page).toHaveTitle(/Best Sports Physiotherapists in India | BookPhysio.in/)
    // Check for Dr. Priya (mock sports physio)
    await expect(page.locator('text=Dr. Priya Sharma')).toBeVisible()
  })

  test('city page renders correct content and title', async ({ page }) => {
    await page.goto('/city/mumbai')
    await expect(page.locator('h1')).toContainText('Physiotherapists in Mumbai')
    await expect(page).toHaveTitle(/Best Physiotherapists in Mumbai | BookPhysio.in/)
    // Check for Dr. Priya (mock Mumbai physio)
    await expect(page.locator('text=Dr. Priya Sharma')).toBeVisible()
  })

  test('city with no doctors shows empty state', async ({ page }) => {
    await page.goto('/city/surat')
    await expect(page.locator('text=No providers currently in Surat')).toBeVisible()
    await expect(page.locator('text=Explore Online Physiotherapists')).toBeVisible()
  })

  test('invalid slug returns 404', async ({ page }) => {
    const response = await page.goto('/city/invalid-city')
    expect(response?.status()).toBe(404)
  })
})
