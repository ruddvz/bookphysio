import { test, expect } from '@playwright/test'

test.describe('Provider Availability Flow', () => {
  test('provider can update availability and save', async ({ page }) => {
    // Navigate to availability page
    await page.goto('/provider/availability')
    
    // Check initial state
    await expect(page.locator('h1')).toContainText('Availability Settings')
    const saveButton = page.getByRole('button', { name: /Save Availability/i })
    await expect(saveButton).toBeDisabled()
    
    // Toggle Saturday
    const toggleSaturday = page.getByLabel(/Toggle Saturday/i)
    await toggleSaturday.click()
    
    // Check that Save button is now enabled
    await expect(saveButton).toBeEnabled()
    await expect(page.locator('text=6 of 7 days active')).toBeVisible()
    
    // Update Monday start time
    const mondayStartInput = page.getByLabel(/Monday start time/i)
    await mondayStartInput.fill('08:00')
    
    // Click save
    await saveButton.click()
    
    // Check for success banner
    await expect(page.locator('text=Availability saved successfully')).toBeVisible()
    
    // Button should be disabled again after save
    await expect(saveButton).toBeDisabled()
    
    // Check slot duration
    const durationBtn60 = page.getByRole('button', { name: /60 mins/i })
    await durationBtn60.click()
    await expect(saveButton).toBeEnabled()
    await saveButton.click()
    
    await expect(page.locator('text=Availability saved successfully')).toBeVisible()
  })

  test('validation errors prevent saving', async ({ page }) => {
    await page.goto('/provider/availability')
    
    const mondayStartInput = page.getByLabel(/Monday start time/i)
    const mondayEndInput = page.getByLabel(/Monday end time/i)
    
    await mondayStartInput.fill('18:00')
    await mondayEndInput.fill('09:00')
    
    const saveButton = page.getByRole('button', { name: /Save Availability/i })
    await saveButton.click()
    
    await expect(page.locator('text=End time must be after start time')).toBeVisible()
    await expect(page.locator('text=Availability saved successfully')).not.toBeVisible()
  })
})
