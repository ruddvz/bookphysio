import { test, expect } from '@playwright/test'

const appointmentsResponse = {
  appointments: [
    {
      id: '1',
      fee_inr: 800,
      status: 'completed',
      created_at: '2026-03-28T10:00:00.000Z',
      visit_type: 'in_clinic',
      payment_status: 'paid',
      payment_amount_inr: 944,
      payment_gst_amount_inr: 144,
      patient: { full_name: 'Rahul Sharma', avatar_url: null },
      availabilities: { starts_at: '2026-03-28T10:00:00.000Z' },
    },
    {
      id: '2',
      fee_inr: 1200,
      status: 'confirmed',
      created_at: '2026-03-27T11:30:00.000Z',
      visit_type: 'home_visit',
      payment_status: 'created',
      payment_amount_inr: 1416,
      payment_gst_amount_inr: 216,
      patient: { full_name: 'Priya Patel', avatar_url: null },
      availabilities: { starts_at: '2026-03-27T11:30:00.000Z' },
    },
    {
      id: '3',
      fee_inr: 800,
      status: 'completed',
      created_at: '2026-03-25T09:00:00.000Z',
      visit_type: 'in_clinic',
      payment_status: 'paid',
      payment_amount_inr: 944,
      payment_gst_amount_inr: 144,
      patient: { full_name: 'Amit Kumar', avatar_url: null },
      availabilities: { starts_at: '2026-03-25T09:00:00.000Z' },
    },
    {
      id: '4',
      fee_inr: 1500,
      status: 'completed',
      created_at: '2026-03-24T17:00:00.000Z',
      visit_type: 'home_visit',
      payment_status: 'paid',
      payment_amount_inr: 1770,
      payment_gst_amount_inr: 270,
      patient: { full_name: 'Sneha Gupta', avatar_url: null },
      availabilities: { starts_at: '2026-03-24T17:00:00.000Z' },
    },
    {
      id: '5',
      fee_inr: 1000,
      status: 'completed',
      created_at: '2026-03-22T16:00:00.000Z',
      visit_type: 'in_clinic',
      payment_status: 'paid',
      payment_amount_inr: 1180,
      payment_gst_amount_inr: 180,
      patient: { full_name: 'Vikram Singh', avatar_url: null },
      availabilities: { starts_at: '2026-03-22T16:00:00.000Z' },
    },
  ],
}

const profileResponse = {
  full_name: 'Dr Priya Iyer',
  consultation_fee_inr: 900,
  iap_registration_no: 'IAP-2026-44',
}

test.describe('Provider Earnings Flow', () => {
  test('provider can view summary stats and transactions', async ({ page }, testInfo) => {
    const baseUrl = testInfo.project.use.baseURL

    if (typeof baseUrl !== 'string') {
      throw new Error('Playwright baseURL must be configured for provider earnings e2e.')
    }

    await page.route('**/api/appointments', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(appointmentsResponse),
      })
    })

    await page.route('**/api/profile', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(profileResponse),
      })
    })

    const demoSessionResponse = await page.context().request.post(new URL('/api/auth/demo-session', baseUrl).toString(), {
      data: { role: 'provider', returnTo: '/provider/earnings' },
    })

    expect(demoSessionResponse.ok()).toBeTruthy()

    await page.goto('/provider/earnings')

    await expect(page.locator('h1')).toContainText(/ledger & earnings/i)
    const generateBillLink = page.getByRole('link', { name: /issue invoice/i })
    await expect(generateBillLink).toBeVisible()

    await expect(page.locator('text=₹4,100').first()).toBeVisible()
    await expect(page.locator('text=₹738')).toBeVisible()

    await expect(page.locator('text=Rahul Sharma')).toBeVisible()
    await expect(page.locator('text=₹800').first()).toBeVisible()
    await expect(page.locator('text=Paid').first()).toBeVisible()

    await expect(page.locator('text=Revenue Growth')).toBeVisible()
    await expect(page.locator('text=Interactive charts will be activated after 10 confirmed sessions')).toBeVisible()

    await generateBillLink.click()
    await expect(page).toHaveURL(/\/provider\/bills\/new/)
    await expect(page.getByRole('heading', { name: /generate invoice/i })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /apply gst \(18%\)/i })).toBeChecked()
  })
})
