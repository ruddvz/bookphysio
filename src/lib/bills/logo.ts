import { readFile } from 'node:fs/promises'
import path from 'node:path'

export async function getBillLogoDataUri(): Promise<string | null> {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = await readFile(logoPath)
    return `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch {
    return null
  }
}