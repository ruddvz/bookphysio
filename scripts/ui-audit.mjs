import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.join(__dirname, '..', 'playwright-report', 'ui-audit')

const pages = [
  { url: 'http://localhost:3001', name: 'homepage' },
  { url: 'http://localhost:3001/search', name: 'search' },
  { url: 'http://localhost:3001/login', name: 'login' },
  { url: 'http://localhost:3001/signup', name: 'signup' },
]

async function capturePages() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })

  for (const pageInfo of pages) {
    const page = await context.newPage()

    // Capture console errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    console.log(`\n--- Navigating to: ${pageInfo.url} ---`)
    try {
      const response = await page.goto(pageInfo.url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })
      console.log(`HTTP status: ${response?.status()}`)
    } catch (err) {
      console.log(`Navigation error: ${err.message}`)
    }

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000)

    // Take full-page screenshot
    const screenshotPath = path.join(outputDir, `${pageInfo.name}.png`)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`Screenshot saved: ${screenshotPath}`)

    // Also take viewport-only screenshot
    const viewportPath = path.join(outputDir, `${pageInfo.name}-viewport.png`)
    await page.screenshot({ path: viewportPath, fullPage: false })

    // Check for BookPhysio text / logo
    const bodyText = await page.evaluate(() => document.body.innerText)
    const hasBookPhysio = bodyText.toLowerCase().includes('bookphysio') ||
      (await page.locator('text=BookPhysio').count()) > 0
    console.log(`BookPhysio text visible: ${hasBookPhysio}`)

    // Check for teal color usage
    const tealElements = await page.evaluate(() => {
      const all = document.querySelectorAll('*')
      let count = 0
      for (const el of all) {
        const style = window.getComputedStyle(el)
        const bg = style.backgroundColor
        const color = style.color
        const borderColor = style.borderColor
        if (
          bg.includes('0, 118, 108') || bg.includes('0,118,108') ||
          color.includes('0, 118, 108') || color.includes('0,118,108') ||
          borderColor.includes('0, 118, 108')
        ) {
          count++
        }
      }
      return count
    })
    console.log(`Elements with teal (#00766C) color: ${tealElements}`)

    // Get page title and h1
    const title = await page.title()
    const h1Text = await page.locator('h1').first().textContent().catch(() => 'none')
    const navVisible = await page.locator('nav').count()
    const footerVisible = await page.locator('footer').count()

    console.log(`Page title: ${title}`)
    console.log(`H1 text: ${h1Text}`)
    console.log(`Nav elements: ${navVisible}`)
    console.log(`Footer elements: ${footerVisible}`)

    if (consoleErrors.length > 0) {
      console.log(`Console ERRORS (${consoleErrors.length}):`)
      consoleErrors.forEach(e => console.log(`  ERROR: ${e}`))
    } else {
      console.log(`Console errors: none`)
    }

    await page.close()
  }

  await browser.close()
  console.log('\nAll screenshots captured.')
}

capturePages().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
