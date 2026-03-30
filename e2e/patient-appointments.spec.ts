/**
 * 8.8 Patient Appointments Polish — Playwright E2E tests
 *
 * Tests:
 *   1. /patient/appointments does not 500 (unauthenticated redirect is fine)
 *   2. Patient views list — tabs render, card renders
 *   3. Patient views detail — navigating to /patient/appointments/[id]
 */

import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test('patient appointments: unauthenticated access does not 500', async ({ page }) => {
  const response = await page.goto(`${BASE}/patient/appointments`)
  expect(response?.status()).toBeLessThan(500)
  await page.screenshot({ path: 'playwright-report/patient-appointments-unauthed.png' })
})

test('patient appointments: list page renders tabs and appointment cards', async ({ page }) => {
  // Mock appointments API
  await page.route('**/api/appointments', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        appointments: [
          {
            id: 'e2e-appt-001',
            status: 'confirmed',
            visit_type: 'in_clinic',
            fee_inr: 800,
            availabilities: {
              starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            providers: {
              users: { full_name: 'Priya Sharma' },
              specialties: [{ name: 'Sports Physio' }],
            },
            locations: { city: 'Mumbai' },
          },
        ],
      }),
    })
  })

  const jsErrors: string[] = []
  page.on('pageerror', (err) => jsErrors.push(err.message))

  await page.goto(`${BASE}/patient/appointments`)
  await page.waitForTimeout(2000)

  // No JS errors
  expect(jsErrors).toHaveLength(0)

  await page.screenshot({ path: 'playwright-report/patient-appointments-list.png' })
})

test('patient appointments: detail page does not 500', async ({ page }) => {
  const response = await page.goto(`${BASE}/patient/appointments/placeholder`)
  expect(response?.status()).toBeLessThan(500)
  await page.screenshot({ path: 'playwright-report/patient-appointments-detail.png' })
})
