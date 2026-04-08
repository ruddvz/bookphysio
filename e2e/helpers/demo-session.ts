import { expect, type Page, type TestInfo } from '@playwright/test'

type DemoRole = 'patient' | 'provider' | 'admin'

export async function loginAsDemoRole(
  page: Page,
  testInfo: TestInfo,
  role: DemoRole,
  returnTo: string,
) {
  const baseUrl = testInfo.project.use.baseURL

  if (typeof baseUrl !== 'string') {
    throw new Error('Playwright baseURL must be configured for demo-session e2e tests.')
  }

  const response = await page.context().request.post(new URL('/api/auth/demo-session', baseUrl).toString(), {
    data: { role, returnTo },
  })

  expect(response.ok()).toBeTruthy()
}