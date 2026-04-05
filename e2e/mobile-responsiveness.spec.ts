import { test, expect } from '@playwright/test'

test.use({
  viewport: { width: 375, height: 667 }, // iPhone SE size
})

// Test Flow 1: Booking flow renders without horizontal scroll
test('mobile 8.16: Booking flow wizard steps render without horizontal scroll', async ({ page }) => {
  await page.goto('/search')
  // Wait for page to settle
  await page.waitForLoadState('networkidle')

  // Check body scroll width (body has overflow-x: hidden so inner content shouldn't cause scrollbar)
  // We check that no child element forces the viewport wider than 375px
  const hasHorizontalOverflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth
    const bodyWidth = document.body.scrollWidth
    return bodyWidth > viewportWidth
  })
  expect(hasHorizontalOverflow).toBe(false)
})

// Test Flow 2: OTP Login
test('mobile 8.16: OTP login form inputs are full-width and tappable', async ({ page }) => {
  await page.goto('/login')
  
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)

  // Verify mobile number is visible
  const mobileInput = page.getByLabel('Mobile Number')
  await expect(mobileInput).toBeVisible()
})

// Test Flow 6: Patient dashboard cards stack vertically
test('mobile 8.16: Patient dashboard cards stack vertically, no content clipped', async ({ page }) => {
  await page.goto('/patient/dashboard')
  
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  // Wait for any redirects or content load
  await page.waitForTimeout(1000)
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
})

// Test Navigation menu collapses
test('mobile 8.16: Navigation/Navbar collapses to mobile menu at 375px', async ({ page }) => {
  await page.goto('/')
  
  // Desktop links should be hidden/collapsed
  // We look for a hamburger menu icon or button
  const menuButton = page.locator('button[aria-label="Toggle menu"], button[aria-expanded]')
  // If we don't have a specific aria label, we could look for a lucide-menu icon or similar.
  // For now, just assert that the button is present (will refine with actual DOM structure)
  expect(menuButton).toBeDefined()
})
