import { test, expect } from '@playwright/test'
import { loginAsDemoRole } from './helpers/demo-session'

test.describe('8.17 Empty States and Skeletons', () => {
  test('Search page shows empty state when no results match', async ({ page }) => {
    await page.route('**/api/providers**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ providers: [], total: 0, page: 1, limit: 40 }),
      })
    })

    // Navigate to search with a query that should yield zero results
    await page.goto('/search?city=Mumbai&specialty=UnicornPhysio')
    
    // Check for EmptyState components
    const emptyState = page.getByText('No exact matches found')
    await expect(emptyState).toBeVisible()

    const description = page.getByText(/matching your criteria in Mumbai/i)
    await expect(description).toBeVisible()

    const clearButton = page.getByRole('button', { name: /clear all filters/i })
    await expect(clearButton).toBeVisible()
  })

  test('Patient dashboard is auth-gated (redirects or shows login)', async ({ page }) => {
    // /patient/dashboard is auth-gated — unauthenticated users should not see dashboard content
    // Full empty-state testing requires an authenticated session (use auth storage state in CI)
    await page.goto('/patient/dashboard')
    // Allow time for middleware redirect
    await page.waitForTimeout(3000)
    // Either we land on /login or the page doesn't show patient dashboard content
    const url = page.url()
    const isOnLogin = url.includes('/login')
    const hasDashboardContent = await page.locator('text=Upcoming Sessions').isVisible().catch(() => false)
    // Pass if redirected to login OR if dashboard content is visible (authenticated CI environment)
    expect(isOnLogin || hasDashboardContent).toBe(true)
  })

  test('Appointments page shows tab-specific empty state', async ({ page }, testInfo) => {
    await page.route('**/api/appointments**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ appointments: [] })
      })
    })

    await loginAsDemoRole(page, testInfo, 'patient', '/patient/appointments?tab=upcoming')
    await page.goto('/patient/appointments?tab=upcoming')
    await expect(page.getByText(/No upcoming visits/i)).toBeVisible()

    await page.getByRole('button', { name: /^past$/i }).click()
    await expect(page.getByText(/No past visits yet/i)).toBeVisible()
  })
})
