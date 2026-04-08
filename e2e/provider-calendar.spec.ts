import { test, expect } from '@playwright/test'
import { loginAsDemoRole } from './helpers/demo-session'

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const todayDate = formatLocalDate(new Date())

const scheduleResponse = {
  entries: [
    {
      visit_id: 'visit-1',
      visit_date: todayDate,
      visit_time: '09:00',
      patient_name: 'Rahul Sharma',
      visit_number: 1,
      fee_inr: 900,
    },
  ],
}

const patientsResponse = {
  patients: [
    {
      profile_id: 'patient-1',
      patient_name: 'Rahul Sharma',
    },
  ],
}

test.describe('Provider Calendar Flow', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.route('**/api/provider/schedule**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(scheduleResponse),
      })
    })

    await page.route('**/api/provider/patients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(patientsResponse),
      })
    })

    await loginAsDemoRole(page, testInfo, 'provider', '/provider/calendar')
    await page.goto('/provider/calendar')
  })

  test('provider can view 7-day calendar and navigation controls', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /calendar/i })).toBeVisible()

    // 7 day headers should be visible
    const dayHeaders = page.locator('div:has-text("Mon"), div:has-text("Tue"), div:has-text("Wed")')
    await expect(dayHeaders.first()).toBeVisible()

    // Navigation buttons
    await expect(page.locator('button:has(svg.lucide-chevron-left)')).toBeVisible()
    await expect(page.locator('button:has(svg.lucide-chevron-right)')).toBeVisible()
    
    await expect(page.getByRole('button', { name: /Book Session/i })).toBeVisible()
  })

  test('calendar grid contains time slots', async ({ page }) => {
    const visitCard = page.locator('div[title*="Rahul Sharma"]').first()

    await expect(visitCard).toBeVisible()
    await expect(visitCard.getByText(/^₹900$/)).toBeVisible()
  })
})
