#!/usr/bin/env node
/**
 * PreToolUse hook: warns when a Write/Edit targets a disallowed root-level path.
 * Exit 0 always (warns, doesn't block). Claude reads stderr and self-corrects.
 */
import { readFileSync } from "fs";

const ALLOWED_ROOT = new Set([
  "CLAUDE.md", "CHANGELOG.md", "AGENTS.md",
  "package.json", "package-lock.json", "tsconfig.json",
  "next.config.ts", "tailwind.config.ts", "postcss.config.mjs",
  "eslint.config.mjs", "playwright.config.ts", "vitest.config.ts",
  "components.json", "vercel.json", "next-env.d.ts",
  ".env.example", ".gitignore", ".mcp.json",
]);

const ROOT_DOC_PATTERNS = [/\.md$/i, /\.pdf$/i, /\.png$/i, /\.jpg$/i, /\.txt$/i];

let input = "";
try {
  input = readFileSync("/dev/stdin", "utf8");
} catch {
  process.exit(0);
}

let payload;
try { payload = JSON.parse(input); } catch { process.exit(0); }

const toolName = payload?.tool_name ?? "";
if (!["Write", "Edit", "MultiEdit"].includes(toolName)) process.exit(0);

const filePath =
  payload?.tool_input?.file_path ??
  payload?.tool_input?.path ??
  (payload?.tool_input?.edits?.[0]?.file_path) ??
  "";

if (!filePath) process.exit(0);

// Normalize to relative path from project root
const relative = filePath.replace(/^.*\/bookphysio\//, "");
const parts = relative.split("/");
const isAtRoot = parts.length === 1;

if (!isAtRoot) process.exit(0); // Only police root-level files

const filename = parts[0];
if (ALLOWED_ROOT.has(filename)) process.exit(0);

const isDisallowed = ROOT_DOC_PATTERNS.some((p) => p.test(filename));
if (!isDisallowed) process.exit(0);

const suggestion = filename.endsWith(".md")
  ? "docs/planning/, docs/research/, or docs/operations/"
  : filename.match(/\.(png|jpg|pdf)$/i)
    ? "docs/assets/screenshots/ or docs/research/"
    : "docs/ or /tmp/";

process.stderr.write(
  `[file-placement] WARNING: "${filename}" should NOT be created at project root.\n` +
  `  → Correct location: ${suggestion}\n` +
  `  → See .claude/rules/common/file-organization.md for the full map.\n`
);

process.exit(0); // Warn only — Claude self-corrects
