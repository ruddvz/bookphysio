import { test, expect } from '@playwright/test'
import { loginAsDemoRole } from './helpers/demo-session'

const availabilityResponse = {
  slots: [
    { starts_at: '2026-04-13T03:30:00.000Z', ends_at: '2026-04-13T04:00:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-13T12:00:00.000Z', ends_at: '2026-04-13T12:30:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-14T03:30:00.000Z', ends_at: '2026-04-14T04:00:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-14T12:00:00.000Z', ends_at: '2026-04-14T12:30:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-15T03:30:00.000Z', ends_at: '2026-04-15T04:00:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-15T12:00:00.000Z', ends_at: '2026-04-15T12:30:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-16T03:30:00.000Z', ends_at: '2026-04-16T04:00:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-16T12:00:00.000Z', ends_at: '2026-04-16T12:30:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-17T03:30:00.000Z', ends_at: '2026-04-17T04:00:00.000Z', is_booked: false, is_blocked: false },
    { starts_at: '2026-04-17T12:00:00.000Z', ends_at: '2026-04-17T12:30:00.000Z', is_booked: false, is_blocked: false },
  ],
}

async function mockProviderAvailability(page: import('@playwright/test').Page) {
  await page.route(/.*\/api\/provider\/availability(\?.*)?$/, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(availabilityResponse),
      })
      return
    }

    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, created: 10 }),
      })
      return
    }

    await route.continue()
  })
}

test.describe('Provider Availability Flow', () => {
  test('provider can update availability and save', async ({ page }, testInfo) => {
    await mockProviderAvailability(page)
    await loginAsDemoRole(page, testInfo, 'provider', '/provider/availability')

    // Navigate to availability page
    await page.goto('/provider/availability')
    
    // Check initial state
    await expect(page.locator('h1')).toContainText(/availability registry/i)
    await expect(page.getByText(/5\s*Active/i)).toBeVisible()
    const saveButton = page.getByRole('button', { name: /Commit Changes/i })
    await expect(saveButton).toBeDisabled()
    
    // Toggle Saturday
    const toggleSaturday = page.getByLabel(/Saturday/i)
    await expect(toggleSaturday).toBeEnabled()
    await toggleSaturday.locator('xpath=ancestor::label[1]').click()
    
    // Check that Save button is now enabled
    await expect(saveButton).toBeEnabled()
    await expect(page.getByText(/6\s*Active/i)).toBeVisible()
    
    // Update Monday start time
    const mondayStartInput = page.locator('input[type="time"]').nth(0)
    await mondayStartInput.fill('08:00')
    
    // Click save
    await saveButton.click()
    
    // Check for success banner
    await expect(page.getByText(/Registry Deployed Successfully/i)).toBeVisible()
    
    // Button should be disabled again after save
    await expect(saveButton).toBeDisabled()
    
    // Check slot duration
    const durationBtn60 = page.getByRole('button', { name: /60 Minutes/i })
    await durationBtn60.click()
    await expect(saveButton).toBeEnabled()
    await saveButton.click()
    
    await expect(page.getByText(/Registry Deployed Successfully/i)).toBeVisible()
  })

  test('validation errors prevent saving', async ({ page }, testInfo) => {
    await mockProviderAvailability(page)
    await loginAsDemoRole(page, testInfo, 'provider', '/provider/availability')

    await page.goto('/provider/availability')
    
    const mondayStartInput = page.locator('input[type="time"]').nth(0)
    const mondayEndInput = page.locator('input[type="time"]').nth(1)
    
    await mondayStartInput.fill('18:00')
    await mondayEndInput.fill('09:00')
    
    const saveButton = page.getByRole('button', { name: /Commit Changes/i })
    await saveButton.click()
    
    await expect(page.locator('text=End time must be after start time')).toBeVisible()
    await expect(page.getByText(/Registry Deployed Successfully/i)).not.toBeVisible()
  })
})
