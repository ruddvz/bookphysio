import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations')

async function getLatestSearchProvidersMigration(): Promise<{ fileName: string; content: string }> {
  const entries = (await readdir(migrationsDir))
    .filter((entry) => entry.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))

  const matchingMigrations: Array<{ fileName: string; content: string }> = []

  for (const fileName of entries) {
    const content = await readFile(path.join(migrationsDir, fileName), 'utf8')

    if (content.includes('CREATE OR REPLACE FUNCTION search_providers_v2')) {
      matchingMigrations.push({ fileName, content })
    }
  }

  const latestMigration = matchingMigrations.at(-1)

  if (!latestMigration) {
    throw new Error('No migration defines search_providers_v2.')
  }

  return latestMigration
}

function extractFunctionBody(content: string): string {
  const match = content.match(/CREATE OR REPLACE FUNCTION search_providers_v2[\s\S]*?AS \$\$([\s\S]*?)\$\$ LANGUAGE plpgsql/i)

  if (!match) {
    throw new Error('Unable to extract search_providers_v2 function body.')
  }

  return match[1]
}

describe('search_providers_v2 migration', () => {
  it('keeps the latest function definition self-contained and safe to execute', async () => {
    const { content } = await getLatestSearchProvidersMigration()
    const functionBody = extractFunctionBody(content)
    const outerSelectStart = functionBody.lastIndexOf('\n  SELECT')
    const outerSelect = outerSelectStart >= 0 ? functionBody.slice(outerSelectStart) : ''

    expect(content).toContain('GREATEST(')
    expect(content).not.toContain('GREATER(')
    expect(content).toContain('ROW_NUMBER() OVER')
    expect(content).toContain('location_rank = 1')
    expect(outerSelect).toContain('NULL::uuid AS location_id')
    expect(outerSelect).toContain('NULL::numeric(10,7) AS lat')
    expect(outerSelect).toContain('NULL::numeric(10,7) AS lng')
    expect(outerSelect).toContain('f.visit_types')
    expect(outerSelect).not.toMatch(/\bl\./)
  })
})