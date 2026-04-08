import { test, expect } from '@playwright/test'

test.describe('Static Pages Check', () => {
  test('FAQ page loads and accordion works', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.locator('h1')).toHaveText(/How can we help\?/)
    
    // Check patients section
    await expect(page.getByRole('heading', { name: 'Patients', level: 2 })).toBeVisible()
    
    // Toggle first question
    const q1 = page.getByRole('button', { name: /How do I book an appointment\?/i })
    const answerPanel = q1.locator('xpath=following-sibling::div[1]')

    await q1.click()
    await expect(answerPanel).toHaveClass(/grid-rows-\[1fr\]/)
    await expect(page.locator('text=You\'ll receive an OTP on your mobile')).toBeVisible()
    
    // Toggle again to close
    await q1.click()
    await expect(answerPanel).toHaveClass(/grid-rows-\[0fr\]/)
  })

  test('How It Works page loads and tabs work', async ({ page }) => {
    await page.goto('/how-it-works')
    await expect(page.locator('h1')).toContainText('How to Book a Physiotherapist')
    
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
    await expect(page.locator('h1')).toContainText("India's focused platform for")
    
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
