import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

const DEFAULT_SITE_URL = 'https://bookphysio.in'
const DEFAULT_PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public')

/**
 * @typedef {object} IndexNowPlanOptions
 * @property {string=} siteUrl
 * @property {string=} publicDir
 * @property {NodeJS.ProcessEnv=} env
 * @property {typeof fetch=} fetchImpl
 */

/**
 * @typedef {object} IndexNowRunOptions
 * @property {boolean=} dryRun
 * @property {string=} siteUrl
 * @property {string=} publicDir
 * @property {NodeJS.ProcessEnv=} env
 * @property {typeof fetch=} fetchImpl
 * @property {Pick<Console, 'info' | 'warn' | 'error'>=} logger
 */

export function normalizeSiteUrl(siteUrl) {
  return siteUrl.trim().replace(/\/+$/, '')
}

export function extractSitemapUrls(sitemapXml) {
  return [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(([, url]) => url.trim())
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index)
}

export async function resolveIndexNowKeyFromPublicDir(publicDir = DEFAULT_PUBLIC_DIR) {
  const publicEntries = await readdir(publicDir, { withFileTypes: true })

  for (const entry of publicEntries) {
    if (!entry.isFile() || !entry.name.endsWith('.txt')) {
      continue
    }

    const filePath = path.join(publicDir, entry.name)
    const fileContents = (await readFile(filePath, 'utf8')).trim()
    const fileStem = path.basename(entry.name, '.txt')

    if (fileContents === fileStem) {
      return fileStem
    }
  }

  return null
}

export function buildIndexNowPayload({ siteUrl, key, urlList }) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  const normalizedUrls = [...new Set(urlList.map((url) => url.trim()).filter(Boolean))]

  if (!key || normalizedUrls.length === 0) {
    return null
  }

  return {
    host: new URL(normalizedSiteUrl).host,
    key,
    keyLocation: `${normalizedSiteUrl}/${key}.txt`,
    urlList: normalizedUrls,
  }
}

/** @param {IndexNowPlanOptions} [options={}] */
export async function createIndexNowPlan({
  siteUrl = DEFAULT_SITE_URL,
  publicDir = DEFAULT_PUBLIC_DIR,
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  const resolvedSiteUrl = normalizeSiteUrl(env.NEXT_PUBLIC_SITE_URL || siteUrl)
  const keyFromEnv = env.INDEXNOW_KEY?.trim()
  const key = keyFromEnv || await resolveIndexNowKeyFromPublicDir(publicDir)

  if (!key) {
    return {
      ready: false,
      reason: 'Missing IndexNow key file or INDEXNOW_KEY override.',
    }
  }

  const sitemapResponse = await fetchImpl(`${resolvedSiteUrl}/sitemap.xml`)

  if (!sitemapResponse.ok) {
    return {
      ready: false,
      reason: `Sitemap request failed with ${sitemapResponse.status}.`,
    }
  }

  const sitemapXml = await sitemapResponse.text()
  const payload = buildIndexNowPayload({
    siteUrl: resolvedSiteUrl,
    key,
    urlList: extractSitemapUrls(sitemapXml),
  })

  if (!payload) {
    return {
      ready: false,
      reason: 'No sitemap URLs available for IndexNow.',
    }
  }

  const keyFileResponse = await fetchImpl(payload.keyLocation, { method: 'HEAD' })

  if (!keyFileResponse.ok) {
    return {
      ready: false,
      reason: `Key file request failed with ${keyFileResponse.status}.`,
    }
  }

  return {
    ready: true,
    payload,
    urlCount: payload.urlList.length,
  }
}

export function parseCliArgs(argv = process.argv.slice(2)) {
  return {
    dryRun: argv.includes('--dry-run'),
  }
}

/** @param {IndexNowRunOptions} [options={}] */
export async function runIndexNowPing({
  dryRun = false,
  siteUrl,
  publicDir,
  env = process.env,
  fetchImpl = fetch,
  logger = console,
} = {}) {
  const plan = await createIndexNowPlan({
    env,
    fetchImpl,
    publicDir,
    siteUrl,
  })

  if (!plan.ready) {
    logger.warn(plan.reason)

    return {
      dryRun: false,
      reason: plan.reason,
      skipped: true,
      urlCount: 0,
    }
  }

  if (dryRun) {
    logger.info(`IndexNow dry run ready for ${plan.urlCount} URLs.`)
    logger.info(JSON.stringify(plan.payload, null, 2))

    return {
      dryRun: true,
      ...plan,
    }
  }

  const response = await fetchImpl(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(plan.payload),
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(`IndexNow ping failed with ${response.status}: ${responseText}`)
  }

  logger.info(`IndexNow ping sent for ${plan.urlCount} URLs. Status: ${response.status}`)

  return {
    dryRun: false,
    skipped: false,
    status: response.status,
    ...plan,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { dryRun } = parseCliArgs()

  runIndexNowPing({ dryRun }).catch((error) => {
    const message = error instanceof Error ? error.message : 'IndexNow ping failed.'
    console.error(message)
    process.exitCode = 1
  })
}