import { test, expect } from '@playwright/test'

test.describe('Static Pages Check', () => {
  test('FAQ page loads and accordion works', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.locator('h1')).toHaveText(/How can we help\?/)
    
    // Check booking section
    await expect(page.getByRole('heading', { name: /Booking a session/i, level: 2 })).toBeVisible()
    
    // Toggle first question
    const q1 = page.getByRole('button', { name: /How do I book a physiotherapist\?/i })
    const answerPanel = q1.locator('xpath=following-sibling::div[1]')

    await q1.click()
    await expect(answerPanel).toHaveClass(/grid-rows-\[1fr\]/)
    await expect(page.getByText(/You will get an OTP on your mobile to confirm/i)).toBeVisible()
    
    // Toggle again to close
    await q1.click()
    await expect(answerPanel).toHaveClass(/grid-rows-\[0fr\]/)
  })

  test('How It Works page loads and tabs work', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('h1')).toContainText(/How to book a physiotherapist online in India/i)
    
    // Check initial patient tab
    await expect(page.getByText('Step 01')).toBeVisible()
    await expect(page.locator('h3').first()).toHaveText('Search')
    
    // Toggle provider tab
    await page.getByRole('button', { name: 'For Providers' }).click()
    await expect(page.locator('h3').first()).toHaveText('Register Practice')
  })

  test('About, Privacy, and Terms pages load with 200 OK', async ({ page }) => {
    // Check About
    const aboutResponse = await page.goto('/about')
    expect(aboutResponse?.status()).toBe(200)
    await expect(page.locator('h1')).toContainText(/A calmer way to find a physiotherapist/i)
    
    // Check Privacy
    const privacyResponse = await page.goto('/privacy')
    expect(privacyResponse?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Privacy Policy')
    
    // Check Terms
    const termsResponse = await page.goto('/terms')
    expect(termsResponse?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText('Terms of Service')
  })
})
