import { test, expect } from '@playwright/test'
import { loginAsDemoRole } from './helpers/demo-session'

test.describe('Admin Dashboard Flow', () => {
  test('admin can view platform overview metrics', async ({ page }, testInfo) => {
    // Mock the stats API so the test is independent of real data
    await page.route('**/api/admin/stats**', async route => {
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

    await loginAsDemoRole(page, testInfo, 'admin', '/admin')
    await page.goto('/admin')

    // Check header
    await expect(page.locator('h1')).toContainText('Platform Overview')

    // Check KPI card labels
    await expect(page.locator('text=Active Providers')).toBeVisible()
    await expect(page.locator('text=Pending Approvals')).toBeVisible()
    await expect(page.locator('text=Total Patients')).toBeVisible()
    await expect(page.locator('text=GMV (Lifetime)')).toBeVisible()

    // Check mocked values render correctly
    await expect(page.getByText('1204', { exact: true })).toBeVisible()
    await expect(page.getByText(/342 providers/i)).toBeVisible()
    await expect(page.locator('a[href="/admin/users"] div').filter({ hasText: '8,921' }).first()).toBeVisible()
    await expect(page.locator('a[href="/admin/analytics"] div').filter({ hasText: '₹12.4L' }).first()).toBeVisible()

    await expect(page.locator('text=Verification Queue')).toBeVisible()
    await expect(page.locator('text=Admin Actions')).toBeVisible()
    await expect(page.getByRole('link', { name: /Review approvals/i })).toBeVisible()
  })
})
