/**
 * Color Token Migration Script
 * Replaces old hardcoded colors with bp-* design tokens.
 * Run: node scripts/migrate-colors.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const SRC_DIR = join(import.meta.dirname, '..', 'src')

// ─── Hex color replacements (inline styles & Tailwind arbitrary values) ───
const HEX_REPLACEMENTS = [
  // Inline style replacements (style={{ color: '#00766C' }})
  // These stay as hex because inline styles don't support Tailwind tokens
  // We only migrate className-based hex values

  // className-based hex → bp-* tokens
  // bg-[#00766C] → bg-bp-accent
  [/bg-\[#00766C\]/gi, 'bg-bp-accent'],
  [/bg-\[#005A52\]/gi, 'bg-bp-primary'],
  [/bg-\[#333333\]/gi, 'bg-bp-primary'],
  [/bg-\[#333\]/gi, 'bg-bp-primary'],
  [/bg-\[#FF6B35\]/gi, 'bg-bp-secondary'],
  [/bg-\[#E6F4F3\]/gi, 'bg-bp-accent/10'],
  [/bg-\[#F5F5F5\]/gi, 'bg-bp-surface'],
  [/bg-\[#F7F8F9\]/gi, 'bg-bp-surface'],
  [/bg-\[#F8F9FA\]/gi, 'bg-bp-surface'],
  [/bg-\[#f7f8f9\]/gi, 'bg-bp-surface'],
  [/bg-\[#FCFDFD\]/gi, 'bg-bp-surface'],

  // text-[#xxx] → text-bp-*
  [/text-\[#00766C\]/gi, 'text-bp-accent'],
  [/text-\[#005A52\]/gi, 'text-bp-primary'],
  [/text-\[#333333\]/gi, 'text-bp-primary'],
  [/text-\[#333\]/gi, 'text-bp-primary'],
  [/text-\[#111111\]/gi, 'text-bp-primary'],
  [/text-\[#666666\]/gi, 'text-bp-body'],
  [/text-\[#666\]/gi, 'text-bp-body'],
  [/text-\[#FF6B35\]/gi, 'text-bp-secondary'],
  [/text-\[#E85D2A\]/gi, 'text-bp-secondary'],
  [/text-\[#888888\]/gi, 'text-bp-body/60'],
  [/text-\[#999999\]/gi, 'text-bp-body/60'],
  [/text-\[#CCCCCC\]/gi, 'text-bp-body/30'],

  // border-[#xxx] → border-bp-*
  [/border-\[#00766C\]/gi, 'border-bp-accent'],
  [/border-\[#005A52\]/gi, 'border-bp-primary'],
  [/border-\[#333333\]/gi, 'border-bp-primary'],
  [/border-\[#333\]/gi, 'border-bp-primary'],
  [/border-\[#E5E5E5\]/gi, 'border-bp-border'],
  [/border-\[#E6F4F3\]/gi, 'border-bp-accent/20'],
  [/border-\[#FF6B35\]/gi, 'border-bp-secondary'],
  [/border-\[#F5F5F5\]/gi, 'border-bp-border'],

  // shadow-[#xxx]
  [/shadow-\[#00766C\]/gi, 'shadow-bp-accent'],

  // ring-[#xxx]
  [/ring-\[#FF6B35\]/gi, 'ring-bp-secondary'],

  // accent-[#xxx] (for range inputs)
  [/accent-\[#00766C\]/gi, 'accent-bp-accent'],

  // hover: variants
  [/hover:bg-\[#00766C\]/gi, 'hover:bg-bp-accent'],
  [/hover:bg-\[#005A52\]/gi, 'hover:bg-bp-primary'],
  [/hover:text-\[#00766C\]/gi, 'hover:text-bp-accent'],
  [/hover:text-\[#E85D2A\]/gi, 'hover:text-bp-secondary'],
  [/hover:border-\[#00766C\]/gi, 'hover:border-bp-accent'],

  // from/to gradient
  [/from-\[#00766C\]/gi, 'from-bp-accent'],
  [/to-\[#005A52\]/gi, 'to-bp-primary'],
  [/from-\[#005A52\]/gi, 'from-bp-primary'],
  [/to-\[#00766C\]/gi, 'to-bp-accent'],
]

// ─── Tailwind color class replacements ───
const TAILWIND_CLASS_REPLACEMENTS = [
  // teal → bp-accent
  [/\bbg-teal-50\b/g, 'bg-bp-accent/10'],
  [/\bbg-teal-100\b/g, 'bg-bp-accent/15'],
  [/\bbg-teal-200\b/g, 'bg-bp-accent/20'],
  [/\bbg-teal-500\b/g, 'bg-bp-accent'],
  [/\bbg-teal-600\b/g, 'bg-bp-accent'],
  [/\bbg-teal-700\b/g, 'bg-bp-accent'],

  [/\btext-teal-400\b/g, 'text-bp-accent/70'],
  [/\btext-teal-500\b/g, 'text-bp-accent'],
  [/\btext-teal-600\b/g, 'text-bp-accent'],
  [/\btext-teal-700\b/g, 'text-bp-accent'],
  [/\btext-teal-700\/70\b/g, 'text-bp-accent/70'],

  [/\bborder-teal-50\b/g, 'border-bp-accent/10'],
  [/\bborder-teal-100\b/g, 'border-bp-accent/20'],
  [/\bborder-teal-200\b/g, 'border-bp-accent/30'],
  [/\bborder-teal-500\b/g, 'border-bp-accent'],
  [/\bborder-teal-600\b/g, 'border-bp-accent'],
  [/\bborder-teal-500\/30\b/g, 'border-bp-accent/30'],

  [/\bring-teal-100\b/g, 'ring-bp-accent/20'],
  [/\bring-teal-200\b/g, 'ring-bp-accent/30'],

  [/\bshadow-teal-50\b/g, 'shadow-bp-accent/10'],
  [/\bshadow-teal-100\b/g, 'shadow-bp-accent/20'],
  [/\bshadow-teal-100\/50\b/g, 'shadow-bp-accent/10'],
  [/\bshadow-teal-200\b/g, 'shadow-bp-accent/30'],

  // hover: teal variants
  [/\bhover:bg-teal-50\b/g, 'hover:bg-bp-accent/10'],
  [/\bhover:bg-teal-100\b/g, 'hover:bg-bp-accent/15'],
  [/\bhover:text-teal-500\b/g, 'hover:text-bp-accent'],
  [/\bhover:text-teal-600\b/g, 'hover:text-bp-accent'],
  [/\bhover:text-teal-700\b/g, 'hover:text-bp-accent'],
  [/\bhover:border-teal-100\b/g, 'hover:border-bp-accent/20'],
  [/\bhover:border-teal-200\/50\b/g, 'hover:border-bp-accent/20'],
  [/\bhover:border-teal-200\b/g, 'hover:border-bp-accent/30'],

  // group-hover: teal
  [/\bgroup-hover:bg-teal-50\b/g, 'group-hover:bg-bp-accent/10'],
  [/\bgroup-hover:text-teal-500\b/g, 'group-hover:text-bp-accent'],
  [/\bgroup-hover:text-teal-600\b/g, 'group-hover:text-bp-accent'],

  // from/via/to teal
  [/\bfrom-teal-500\b/g, 'from-bp-accent'],
  [/\bfrom-teal-600\b/g, 'from-bp-accent'],
  [/\bto-teal-600\b/g, 'to-bp-accent'],
  [/\bto-teal-700\b/g, 'to-bp-accent'],
  [/\bvia-teal-500\b/g, 'via-bp-accent'],

  // teal-50/50 special patterns
  [/\bbg-teal-50\/50\b/g, 'bg-bp-accent/5'],
  [/\bbg-teal-50\/30\b/g, 'bg-bp-accent/5'],
  [/\bhover:bg-teal-50\/30\b/g, 'hover:bg-bp-accent/5'],

  // orange → bp-secondary
  [/\bbg-orange-50\b/g, 'bg-bp-secondary/10'],
  [/\bbg-orange-500\b/g, 'bg-bp-secondary'],
  [/\bbg-orange-600\b/g, 'bg-bp-secondary'],
  [/\btext-orange-500\b/g, 'text-bp-secondary'],
  [/\btext-orange-600\b/g, 'text-bp-secondary'],
  [/\btext-orange-700\b/g, 'text-bp-secondary'],
  [/\bborder-orange-100\b/g, 'border-bp-secondary/20'],
  [/\bborder-orange-200\b/g, 'border-bp-secondary/30'],
  [/\bhover:bg-orange-500\b/g, 'hover:bg-bp-secondary'],

  // gray → bp-* (selective — only UI chrome, not actual gray intent)
  [/\bbg-gray-50\b/g, 'bg-bp-surface'],
  [/\bbg-gray-100\b/g, 'bg-bp-surface'],
  [/\bbg-gray-50\/50\b/g, 'bg-bp-surface/50'],
  [/\bhover:bg-gray-50\b/g, 'hover:bg-bp-surface'],
  [/\bhover:bg-gray-50\/50\b/g, 'hover:bg-bp-surface/50'],
  [/\bhover:bg-gray-100\b/g, 'hover:bg-bp-surface'],

  [/\bborder-gray-50\b/g, 'border-bp-border/50'],
  [/\bborder-gray-100\b/g, 'border-bp-border'],
  [/\bborder-gray-200\b/g, 'border-bp-border'],
  [/\bborder-gray-100\/80\b/g, 'border-bp-border/80'],
  [/\bhover:border-gray-300\b/g, 'hover:border-bp-body/30'],
  [/\bhover:border-gray-200\b/g, 'hover:border-bp-border'],

  [/\btext-gray-300\b/g, 'text-bp-body/30'],
  [/\btext-gray-400\b/g, 'text-bp-body/40'],
  [/\btext-gray-500\b/g, 'text-bp-body'],
  [/\btext-gray-500\/90\b/g, 'text-bp-body/90'],
  [/\btext-gray-600\b/g, 'text-bp-body'],
  [/\bhover:text-gray-500\b/g, 'hover:text-bp-body'],
  [/\bhover:text-gray-600\b/g, 'hover:text-bp-body'],
  [/\bgroup-hover:text-gray-500\b/g, 'group-hover:text-bp-body'],

  [/\bring-gray-100\b/g, 'ring-bp-border'],
]

// ─── Files to skip ───
const SKIP_PATTERNS = [
  /\.test\.(ts|tsx)$/,
  /design-tokens\.test/,
  /globals\.css$/,
  /node_modules/,
  /\.next/,
  /test-results/,
  /vitest\.config/,
]

function shouldSkip(filepath) {
  return SKIP_PATTERNS.some(p => p.test(filepath))
}

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...walk(full))
    } else {
      const ext = extname(full)
      if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
        results.push(full)
      }
    }
  }
  return results
}

// ─── Main ───
let totalFiles = 0
let totalReplacements = 0

const files = walk(SRC_DIR).filter(f => !shouldSkip(f))

for (const filepath of files) {
  let content = readFileSync(filepath, 'utf-8')
  let fileReplacements = 0

  // Apply hex replacements
  for (const [pattern, replacement] of HEX_REPLACEMENTS) {
    const matches = content.match(pattern)
    if (matches) {
      fileReplacements += matches.length
      content = content.replace(pattern, replacement)
    }
  }

  // Apply Tailwind class replacements
  for (const [pattern, replacement] of TAILWIND_CLASS_REPLACEMENTS) {
    const matches = content.match(pattern)
    if (matches) {
      fileReplacements += matches.length
      content = content.replace(pattern, replacement)
    }
  }

  if (fileReplacements > 0) {
    writeFileSync(filepath, content)
    totalFiles++
    totalReplacements += fileReplacements
    const rel = filepath.replace(SRC_DIR, 'src').replaceAll('\\', '/')
    console.log(`  ✓ ${rel} — ${fileReplacements} replacements`)
  }
}

console.log(`\n✅ Migration complete: ${totalReplacements} replacements across ${totalFiles} files`)
