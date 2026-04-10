import { test, expect } from '@playwright/test'

test.describe('Specialty & City Landing Pages', () => {
  test('specialty page renders correct content and title', async ({ page }) => {
    await page.goto('/specialty/sports')
    await expect(page.locator('h1')).toContainText('Sports Sciences Physiotherapists')
    await expect(page).toHaveTitle(/Best Sports Sciences Physiotherapists in India/)
    await expect(page.getByRole('link', { name: /search sports sciences/i })).toBeVisible()
  })

  test('city page renders correct content and title', async ({ page }) => {
    await page.goto('/city/mumbai')
    await expect(page.locator('h1')).toContainText('Physiotherapists in Mumbai')
    await expect(page).toHaveTitle(/Best Physiotherapists in Mumbai | BookPhysio.in/)
    await expect(page.getByRole('link', { name: /search in mumbai/i })).toBeVisible()
  })

  test('city landing still renders a search CTA when live providers are unavailable', async ({ page }) => {
    await page.goto('/city/surat')
    await expect(page.locator('h1')).toContainText('Physiotherapists in Surat')
    await expect(page.getByRole('link', { name: /search in surat/i })).toBeVisible()
  })

  test('invalid slug returns 404', async ({ page }) => {
    const response = await page.goto('/city/invalid-city')
    expect(response?.status()).toBe(404)
  })
})
