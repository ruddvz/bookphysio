import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createIndexNowPlan,
  extractSitemapUrls,
  resolveIndexNowKeyFromPublicDir,
  runIndexNowPing,
} from './ping-indexnow.mjs'

const SITE_URL = 'https://bookphysio.in'
const INDEXNOW_KEY = '9e3b426a8d844146a2ee1fac2c3fc665'

const SAMPLE_SITEMAP = `
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://bookphysio.in/</loc></url>
    <url><loc>https://bookphysio.in/search</loc></url>
    <url><loc>https://bookphysio.in/search</loc></url>
  </urlset>
`

const createLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
})

const createResponse = (body: string, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => body,
}) as Response

const tempDirs: string[] = []

afterEach(async () => {
  vi.restoreAllMocks()

  await Promise.all(
    tempDirs.splice(0).map((dirPath) => rm(dirPath, { recursive: true, force: true })),
  )
})

async function createPublicDirWithKey() {
  const dirPath = await mkdtemp(path.join(os.tmpdir(), 'indexnow-'))
  tempDirs.push(dirPath)
  await writeFile(path.join(dirPath, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY)
  return dirPath
}

describe('IndexNow automation', () => {
  it('extracts deduplicated URLs from sitemap XML', () => {
    expect(extractSitemapUrls(SAMPLE_SITEMAP)).toEqual([
      'https://bookphysio.in/',
      'https://bookphysio.in/search',
    ])
  })

  it('resolves the hosted key from the public directory', async () => {
    const publicDir = await createPublicDirWithKey()

    await expect(resolveIndexNowKeyFromPublicDir(publicDir)).resolves.toBe(INDEXNOW_KEY)
  })

  it('skips plan creation when no key file is available', async () => {
    const publicDir = await mkdtemp(path.join(os.tmpdir(), 'indexnow-missing-'))
    tempDirs.push(publicDir)
    const fetchImpl = vi.fn()

    await expect(
      createIndexNowPlan({
        fetchImpl: fetchImpl as unknown as typeof fetch,
        publicDir,
        siteUrl: SITE_URL,
      }),
    ).resolves.toMatchObject({
      ready: false,
      reason: expect.stringContaining('key'),
    })

    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('supports dry runs with the hosted key file location', async () => {
    const publicDir = await createPublicDirWithKey()
    const fetchImpl = vi.fn(async (url: string, options?: { method?: string }) => {
      if (url === `${SITE_URL}/sitemap.xml`) {
        return createResponse(SAMPLE_SITEMAP)
      }

      if (url === `${SITE_URL}/${INDEXNOW_KEY}.txt` && options?.method === 'HEAD') {
        return createResponse('', true, 200)
      }

      throw new Error(`Unexpected fetch for ${url}`)
    })

    const logger = createLogger()

    await expect(
      runIndexNowPing({
        dryRun: true,
        fetchImpl: fetchImpl as unknown as typeof fetch,
        logger: logger as unknown as Console,
        publicDir,
        siteUrl: SITE_URL,
      }),
    ).resolves.toMatchObject({
      dryRun: true,
      payload: {
        host: 'bookphysio.in',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: [
          'https://bookphysio.in/',
          'https://bookphysio.in/search',
        ],
      },
      urlCount: 2,
    })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(logger.info).toHaveBeenCalled()
  })

  it('throws when IndexNow rejects the publish request', async () => {
    const publicDir = await createPublicDirWithKey()
    const fetchImpl = vi.fn(async (url: string, options?: { method?: string }) => {
      if (url === `${SITE_URL}/sitemap.xml`) {
        return createResponse(SAMPLE_SITEMAP)
      }

      if (url === `${SITE_URL}/${INDEXNOW_KEY}.txt` && options?.method === 'HEAD') {
        return createResponse('', true, 200)
      }

      if (url === 'https://api.indexnow.org/indexnow' && options?.method === 'POST') {
        return createResponse('temporary failure', false, 503)
      }

      throw new Error(`Unexpected fetch for ${url}`)
    })

    await expect(
      runIndexNowPing({
        fetchImpl: fetchImpl as unknown as typeof fetch,
        logger: createLogger() as unknown as Console,
        publicDir,
        siteUrl: SITE_URL,
      }),
    ).rejects.toThrow('IndexNow ping failed with 503: temporary failure')
  })
})