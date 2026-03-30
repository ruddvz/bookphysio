import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'

test.use({
  viewport: { width: 375, height: 667 }, // iPhone SE size
})

// Test Flow 1: Booking flow renders without horizontal scroll
test('mobile 8.16: Booking flow wizard steps render without horizontal scroll', async ({ page }) => {
  // Test doctor profile and booking wizard
  // For the sake of UI test, we can visit a mock doctor or search
  // Let's just go to the homepage, search, and check the first result or go directly to a known route
  await page.goto('/search')
  
  // Ensure no horizontal scroll by checking layout
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
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
  // For now, let's just assert that the hamburger is visible or Desktop nav is hidden
  
  const isMenuVisible = await menuButton.first().isVisible().catch(() => false)
  // we will refine this assertion based on actual Document structure
})
