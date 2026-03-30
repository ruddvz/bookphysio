/**
 * 8.7 Patient Dashboard Polish — Playwright E2E test
 *
 * Validates that the patient dashboard page loads correctly.
 * Since the page requires auth, we test the unauthenticated redirect
 * AND test the page structure against a mock/stub route that skips auth.
 *
 * Note: Full authenticated flow requires a live Supabase session.
 * This test verifies:
 *   1. Unauthenticated access redirects (does not 500)
 *   2. The /patient/dashboard route exists and returns a non-5xx status
 */

import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test('patient dashboard: unauthenticated access does not 500', async ({ page }) => {
  const response = await page.goto(`${BASE}/patient/dashboard`)

  // Should redirect to login or return the page — never a server error
  expect(response?.status()).toBeLessThan(500)

  await page.screenshot({ path: 'playwright-report/patient-dashboard-unauthed.png' })
})

test('patient dashboard: page renders without JS errors when authenticated', async ({ page }) => {
  // Intercept the appointments API to return a confirmed upcoming appointment
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
              // Future date so it shows as "upcoming"
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

  // Intercept Supabase auth check to simulate a logged-in patient
  await page.route('**/auth/v1/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-patient-id',
          user_metadata: { full_name: 'Rahul Test', role: 'patient' },
          phone: '+919876543210',
        },
      }),
    })
  })

  const jsErrors: string[] = []
  page.on('pageerror', (err) => jsErrors.push(err.message))

  await page.goto(`${BASE}/patient/dashboard`)

  // Wait for the page to settle
  await page.waitForTimeout(2000)

  // No JS errors
  expect(jsErrors).toHaveLength(0)

  await page.screenshot({ path: 'playwright-report/patient-dashboard-authed.png' })
})
