import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard Flow', () => {
  test('admin can view platform overview metrics', async ({ page }) => {
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

    await page.goto('/login')
    await page.getByRole('button', { name: /open admin demo/i }).click()

    // Check header
    await expect(page.locator('h1')).toContainText(/platform overview/i)

    // Check KPI card labels
    await expect(page.getByText(/active providers/i)).toBeVisible()
    await expect(page.getByText(/pending approvals/i).first()).toBeVisible()
    await expect(page.getByText(/total patients/i)).toBeVisible()
    await expect(page.getByText(/completed gmv/i).first()).toBeVisible()

    // Check mocked values render correctly
    await expect(page.getByText('1204', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(/342 provider/i).first()).toBeVisible()
    await expect(page.getByText('8,921').first()).toBeVisible()
    await expect(page.getByText('₹12.4L').first()).toBeVisible()

    await expect(page.getByText(/verification queue/i)).toBeVisible()
    await expect(page.getByText(/admin actions/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Review approvals/i }).first()).toBeVisible()
  })
})
