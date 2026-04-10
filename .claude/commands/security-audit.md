# Security Audit Command

Full-spectrum security audit combining Shield orchestration and Shannon pentesting methodology.

## Usage

```
/security-audit [mode]
```

**Modes:**
- `quick` — SCA + secrets + AI SAST only (~3 min)
- `full` — All phases including pentest analysis (~10-15 min) ← **default**
- `pentest` — Shannon 5-domain attack analysis only (auth, injection, XSS, SSRF, business logic)
- `sast` — AI static analysis only (TypeScript/Next.js rules)
- `fix` — Generate fix diffs for existing findings
- `verify` — Re-scan and compare against saved baseline
- `score` — Display current risk score from last baseline
- `outdated` — Dependency freshness check only

## Instructions

Follow the `security-full-scan` skill pipeline exactly. The mode from $ARGUMENTS determines which phases to run:

### Mode: `quick` (or no argument)
Run Phases 1 (recon only), 2 (all tool scans), and 3 (AI SAST).
Skip Phases 4 (pentest domains) and produce abbreviated report.

### Mode: `full`
Run all 6 phases. This is the complete Shield + Shannon pipeline.

### Mode: `pentest`
Run Phase 1 (full recon) and Phase 4 (all 5 Shannon attack domains).
Focus report on attack chains, PoC evidence, and exploitability.

### Mode: `sast`
Run Phase 3 only (all Rule Groups A through I).
Output findings per rule group with exact file:line references.

### Mode: `fix`
1. Load `.claude/security-baseline.json` if it exists
2. For each finding, analyze the specific code location
3. Generate before/after fix diff
4. Ask which fixes to apply, by severity tier

### Mode: `verify`
1. Run full scan (all phases)
2. Load `.claude/security-baseline.json`
3. Compare: new / resolved / persistent findings
4. Show score delta

### Mode: `score`
1. Load `.claude/security-baseline.json`
2. Recalculate score from stored finding counts
3. Display scorecard with risk level and bar chart

### Mode: `outdated`
1. Run `npm outdated --json`
2. Classify by MAJOR / MINOR / PATCH gap
3. Flag security-relevant packages
4. Show remediation commands

## Output Format

Always produce the report in this order:

```
╔══════════════════════════════════════════════════════════════╗
║           BOOKPHYSIO SECURITY AUDIT REPORT                   ║
║           [DATE] · Mode: [MODE] · Stack: Next.js/TypeScript  ║
╚══════════════════════════════════════════════════════════════╝

SECURITY SCORE: XX/100 — [RISK LEVEL]
[██████████░░░░░░░░░░] XX/100
(bar: score÷5 = filled ██ blocks out of 20; e.g. 85/100 → 17 filled + 3 empty)

┌─────────────┬───────┐
│ Severity    │ Count │
├─────────────┼───────┤
│ 🚨 CRITICAL │     X │
│ 🔴 HIGH     │     X │
│ 🟡 MEDIUM   │     X │
│ 🟢 LOW      │     X │
│ ℹ️  INFO     │     X │
└─────────────┴───────┘

TOOLS RUN: [list]
TOOLS SKIPPED: [list with reason]
FILES SCANNED: X
SCAN DURATION: ~X min

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚨 CRITICAL FINDINGS

[BP-XXX] Finding Title
  File: src/app/api/...route.ts:42
  CWE: CWE-89 | OWASP: A03:2021
  Evidence: [exact code]
  Impact: [what attacker can do]
  Fix: [specific code fix]
  Compliance: SOC2-CC6.8 · HIPAA-164.312

## 🔴 HIGH FINDINGS
[...]

## 🟡 MEDIUM FINDINGS
[...]

## 🟢 LOW FINDINGS
[...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ⛓️ ATTACK CHAINS
[Multi-step exploitation narratives]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📦 DEPENDENCY AUDIT
[CVEs + outdated packages]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🗺️ COMPLIANCE MAPPING
[SOC 2 / PCI-DSS / HIPAA / India IT Act]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🛠️ REMEDIATION ROADMAP
Priority 1 (Fix Now): [CRITICAL items]
Priority 2 (Fix This Sprint): [HIGH items]
Priority 3 (Fix Next Sprint): [MEDIUM items]
Maintenance: [LOW + outdated deps]
```

After report, save baseline to `.claude/security-baseline.json`:
```json
{
  "scan_date": "[ISO timestamp]",
  "mode": "[mode used]",
  "score": XX,
  "risk_level": "[RISK LEVEL]",
  "findings": {
    "critical": X,
    "high": X,
    "medium": X,
    "low": X,
    "info": X
  },
  "finding_ids": ["BP-001", "BP-002", ...],
  "tools_run": ["npm-audit", "npm-outdated", "git-secrets", "ai-sast", "shannon-pentest"],
  "tools_skipped": []
}
```

## Escalation

If CRITICAL findings are discovered:
1. State clearly: "⚠️ CRITICAL SECURITY ISSUE FOUND — do not deploy until fixed"
2. Provide the exact file:line and fix immediately
3. If credentials leaked: "🚨 Rotate these secrets NOW before doing anything else"
4. Invoke `security-reviewer` agent for additional analysis if needed
