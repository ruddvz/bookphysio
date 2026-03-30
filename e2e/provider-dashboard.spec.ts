/**
 * 8.9 Provider Dashboard Polish — Playwright E2E tests
 *
 * Tests:
 *   1. Unauthenticated access does not 500
 *   2. Page renders without JS errors when appointments API responds
 */

import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test('provider dashboard: unauthenticated access does not 500', async ({ page }) => {
  const response = await page.goto(`${BASE}/provider/dashboard`)
  expect(response?.status()).toBeLessThan(500)
  await page.screenshot({ path: 'playwright-report/provider-dashboard-unauthed.png' })
})

test('provider dashboard: renders without JS errors with mocked appointments', async ({ page }) => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  tomorrow.setHours(10, 0, 0, 0)

  await page.route('**/api/appointments', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        appointments: [
          {
            id: 'e2e-provider-appt-001',
            status: 'confirmed',
            visit_type: 'in_clinic',
            fee_inr: 900,
            availabilities: {
              starts_at: new Date().toISOString(), // today
            },
            patient: { full_name: 'Rahul Test' },
            locations: { city: 'Mumbai' },
          },
        ],
      }),
    })
  })

  const jsErrors: string[] = []
  page.on('pageerror', (err) => jsErrors.push(err.message))

  await page.goto(`${BASE}/provider/dashboard`)
  await page.waitForTimeout(2000)

  expect(jsErrors).toHaveLength(0)

  await page.screenshot({ path: 'playwright-report/provider-dashboard-authed.png' })
})
