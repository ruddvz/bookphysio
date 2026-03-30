import { test, expect } from '@playwright/test'

test.describe('8.17 Empty States and Skeletons', () => {
  test('Search page shows empty state when no results match', async ({ page }) => {
    // Navigate to search with a query that should yield zero results
    await page.goto('/search?specialty=UnicornPhysio')
    
    // Check for EmptyState components
    const emptyState = page.locator('h3:has-text("No physiotherapists found")')
    await expect(emptyState).toBeVisible()
    
    const description = page.getByText(/We couldn't find any physiotherapists matching your criteria/i)
    await expect(description).toBeVisible()
    
    const clearButton = page.getByRole('button', { name: /clear all filters/i })
    await expect(clearButton).toBeVisible()
  })

  test('Patient dashboard shows empty state for upcoming sessions when none exist', async ({ page }) => {
    // For this test we assume a user with no appointments
    // We can simulate this by mocking the API response
    await page.route('/api/appointments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ appointments: [] })
      })
    })

    await page.goto('/patient/dashboard')
    
    // Check for the EmptyState title directly - it might take a moment to load
    const emptyTitle = page.getByText('No upcoming sessions')
    await expect(emptyTitle).toBeVisible({ timeout: 10000 })
    
    const cta = page.getByRole('link', { name: /find a physio/i })
    await expect(cta).toBeVisible()
  })

  test('Appointments page shows tab-specific empty state', async ({ page }) => {
    await page.route('/api/appointments', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ appointments: [] })
      })
    })

    await page.goto('/patient/appointments?tab=upcoming')
    await expect(page.getByText('No upcoming appointments')).toBeVisible()
    
    await page.click('button:has-text("past")')
    await expect(page.getByText('No past appointments')).toBeVisible()
  })
})
