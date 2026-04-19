#!/usr/bin/env node
/**
 * One-time script: removes green screen background from character PNG images.
 * Pixels where green channel dominates (G > R*1.4 AND G > B*1.4 AND G > 100)
 * are made fully transparent.
 *
 * Run: node scripts/remove-green-bg.mjs
 */

import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join } from 'path'

const DIR = new URL('../public/images/characters', import.meta.url).pathname

const files = (await readdir(DIR)).filter(f => f.endsWith('.png') && !f.startsWith('README'))

for (const file of files) {
  const filePath = join(DIR, file)
  const image = sharp(filePath)
  const { width, height } = await image.metadata()

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const buf = Buffer.from(data)
  const channels = info.channels // should be 4 (RGBA)

  for (let i = 0; i < buf.length; i += channels) {
    const r = buf[i]
    const g = buf[i + 1]
    const b = buf[i + 2]
    if (g > 100 && g > r * 1.4 && g > b * 1.4) {
      buf[i + 3] = 0 // transparent
    }
  }

  await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toFile(filePath + '.tmp')

  const { rename } = await import('fs/promises')
  await rename(filePath + '.tmp', filePath)

  console.log(`✓ ${file}`)
}

console.log('Done.')
