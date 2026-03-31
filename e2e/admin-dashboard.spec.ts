import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Flow', () => {
  test('admin can view platform overview metrics', async ({ page }) => {
    // Mock the stats API so the test is independent of real data
    await page.route('/api/admin/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          activeProviders: 1204,
          pendingApprovals: 342,
          totalPatients: 8921,
          gmvMtd: 1240000
        })
      })
    })

    await page.goto('/admin')

    // Check header
    await expect(page.locator('h1')).toContainText('Platform Overview')

    // Check KPI card labels
    await expect(page.locator('text=Active Providers')).toBeVisible()
    await expect(page.locator('text=Pending Approvals')).toBeVisible()
    await expect(page.locator('text=Total Patients')).toBeVisible()
    await expect(page.locator('text=GMV (MTD)')).toBeVisible()

    // Check mocked values render correctly
    await expect(page.locator('text=1,204')).toBeVisible()
    await expect(page.locator('text=342')).toBeVisible()
    await expect(page.locator('text=8,921')).toBeVisible()
    await expect(page.locator('text=₹12.4L')).toBeVisible()

    // Check chart placeholders
    await expect(page.locator('text=Bookings Growth')).toBeVisible()
    await expect(page.locator('text=Top Specialties')).toBeVisible()

    // Check View Report button exists
    const viewReportBtn = page.getByRole('button', { name: /View Report/i })
    await expect(viewReportBtn).toBeVisible()
  })
})
