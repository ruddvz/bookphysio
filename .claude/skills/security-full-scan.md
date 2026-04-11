---
name: security-full-scan
description: >
  Full-spectrum security scan combining Shield orchestration (SAST, SCA, secrets,
  dependency freshness, 0-100 risk score, compliance mapping) and Shannon pentesting
  methodology (recon, data-flow analysis, 5-domain attack coverage, PoC mindset).
  One command scans everything and produces an actionable report.
origin: Shield+Shannon integration
---

# Security Full Scan — Shield × Shannon Edition

Combines the orchestration pipeline from **Shield** (SAST · SCA · Secrets · Scorecard)
with the white-box pentesting methodology from **Shannon** (Recon · Data-Flow · Attack Domains · PoC validation).

---

## When to Activate

- On-demand security audit of the entire codebase
- Before any production release
- After adding new API endpoints, auth flows, or payment code
- After dependency updates
- When asked to "scan the codebase" or "security report"

---

## Pipeline Overview

```
PHASE 1 — RECON (Shannon-style)
  └─ Stack detection · API surface enumeration · Trust boundary mapping

PHASE 2 — AUTOMATED TOOL SCANS (Shield-style, parallel)
  ├─ SCA:       npm audit --json            → CVE findings
  ├─ Freshness: npm outdated --json         → Outdated packages
  ├─ Secrets:   git log + grep patterns     → Leaked credentials
  └─ Config:    next.config.ts, vercel.json → IaC issues

PHASE 3 — AI SAST (Shield 82-rule approach via LLM)
  TypeScript/Next.js specific patterns
  ├─ Injection, XSS, SSRF, Path Traversal
  ├─ Auth/Authz flaws, JWT handling
  ├─ Prototype Pollution, Mass Assignment
  └─ Insecure crypto, weak randomness

PHASE 4 — PENTEST ANALYSIS (Shannon 5-domain, parallel)
  ├─ DOMAIN A: Injection     → SQL, NoSQL, Command, LDAP, Template
  ├─ DOMAIN B: XSS           → Stored, Reflected, DOM-based
  ├─ DOMAIN C: SSRF          → User-supplied URLs, fetches, redirects
  ├─ DOMAIN D: Auth/Authz    → JWT attacks, IDOR, Privilege Escalation
  └─ DOMAIN E: Business Logic → Race conditions, Mass Assignment, Invariant violations

PHASE 5 — CONSOLIDATION (Shield scorecard + compliance)
  └─ Risk score (0-100) · CWE mapping · OWASP mapping · Compliance (SOC 2 / PCI-DSS / HIPAA)

PHASE 6 — REPORT GENERATION
  └─ Structured findings · Fix proposals · Attack chains · Baseline delta
```

---

## Phase 1: Reconnaissance (Shannon-style)

Enumerate the attack surface before any analysis:

### 1.1 Stack Detection
```bash
# Detect package manager and framework
ls package.json package-lock.json yarn.lock pnpm-lock.yaml bun.lockb 2>/dev/null
node -e "const p=require('./package.json'); console.log(JSON.stringify({name:p.name,deps:Object.keys({...p.dependencies,...p.devDependencies})}));"
```

Identify from package.json:
- Framework: Next.js version, React version
- Auth: next-auth, supabase, etc.
- DB: supabase, prisma, drizzle, etc.
- Payment: razorpay, stripe, etc.
- File upload libraries
- HTTP clients (fetch, axios, got)

### 1.2 API Surface Enumeration
```bash
# Find all API routes
find src/app/api -name "route.ts" -o -name "route.tsx" | sort
# Find all middleware
find src -name "middleware.ts" | head -10
# Find all webhook endpoints
grep -r "webhook" src/app/api --include="*.ts" -l
```

Document for each route:
- HTTP methods accepted
- Authentication required (y/n)
- Rate limiting present (y/n)
- User-controlled input sources
- External service calls

### 1.3 Trust Boundary Mapping
Identify:
- Public routes (no auth required)
- Authenticated routes (session/token required)
- Admin-only routes (role required)
- Webhook receivers (signature validation required)
- External API calls (SSRF surface)

---

## Phase 2: Automated Tool Scans

### 2.1 SCA — Dependency Vulnerability Audit
```bash
npm audit --json 2>/dev/null || npm audit
```

Parse output for:
- CRITICAL vulnerabilities (CWE, package, fix version)
- HIGH vulnerabilities
- Severity distribution
- Direct vs transitive

### 2.2 Dependency Freshness
```bash
npm outdated --json 2>/dev/null || npm outdated
```

Classify per package:
- **MAJOR behind**: Breaking change risk (HIGH — may include security architecture changes)
- **MINOR behind**: Feature/security gap (MEDIUM — often includes hardening)
- **PATCH behind**: Bug/CVE fixes missed (varies — frequently contains CVE fixes)

### 2.3 Secrets Scanning (gitleaks pattern library — grep implementation)

Scan current files AND git history:

```bash
# Current files — high-signal patterns
grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env*" \
  -E "(sk-[a-zA-Z0-9]{20,}|rz_(live|test)_[a-zA-Z0-9]{20,}|AAAA[a-zA-Z0-9_-]{15,}|eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}|ghp_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|AIza[a-zA-Z0-9_-]{35}|SG\.[a-zA-Z0-9_-]{22,}|xox[baprs]-[a-zA-Z0-9-]{10,}|sq0atp-[a-zA-Z0-9_-]{22}|key_[a-zA-Z0-9]{32,}|secret_[a-zA-Z0-9]{20,})" \
  --exclude-dir=node_modules --exclude-dir=.git \
  src/ .env* 2>/dev/null | grep -v ".env.example"

# Git history — look for accidentally committed secrets
git log --all --full-history --diff-filter=A -- "*.env" "*.env.local" "*.env.production" 2>/dev/null | head -20
git log --oneline --all -p -- "*.env*" 2>/dev/null | grep "^\+" | grep -iE "(key|token|secret|password|credential)" | grep -v ".example" | head -30
```

Check for hardcoded values in code:
```bash
grep -r --include="*.ts" --include="*.tsx" \
  -E "(password\s*=\s*['\"][^'\"]{6,}['\"]|api_key\s*=\s*['\"][^'\"]{10,}['\"]|token\s*=\s*['\"][^'\"]{10,}['\"])" \
  --exclude-dir=node_modules src/ 2>/dev/null | grep -v "test\|spec\|mock\|example\|placeholder\|YOUR_"
```

### 2.4 IaC / Config Review

Review these files for security misconfigurations:
- `next.config.ts` — CSP headers, CORS, security headers, allowed origins
- `vercel.json` — Route rewrites, access controls
- `.github/workflows/` — Secret exposure in CI/CD, dependency pinning
- `supabase/` — RLS policies, storage policies
- `middleware.ts` — Auth enforcement coverage

---

## Phase 3: AI SAST — TypeScript / Next.js Rules

Apply these patterns across all `src/**/*.ts` and `src/**/*.tsx` files.
Adapted from Shield's 82-rule SAST engine — JS/TS rules relevant to this stack.

### Rule Group A: Injection (CRITICAL)

**A1 — SQL / NoSQL Raw Query Injection**
Flag: Template literals or string concatenation inside `.from()`, `.query()`, `.rpc()`, `supabase.rpc()`, or any raw SQL.
```bash
grep -rn --include="*.ts" "\.query\s*(\`\|\.rpc\s*(\`\|supabase.*\$\{" src/ 2>/dev/null
```
Evidence: Any `${userInput}` inside a DB call without parameterization.
CWE: CWE-89 | OWASP: A03:2021 | Severity: CRITICAL

**A2 — Command Injection**
Flag: `exec`, `execSync`, `spawn`, `spawnSync`, `eval`, `new Function(` with user-controlled args.
```bash
grep -rn --include="*.ts" -E "(exec|spawn|eval)\s*\(" src/ 2>/dev/null | grep -v "test\|spec"
```
CWE: CWE-78 | OWASP: A03:2021 | Severity: CRITICAL

**A3 — Server-Side Template Injection**
Flag: Template engines (handlebars, nunjucks, ejs, mustache) rendering user input.
CWE: CWE-94 | OWASP: A03:2021 | Severity: CRITICAL

### Rule Group B: XSS (HIGH)

**B1 — Stored/Reflected XSS via dangerouslySetInnerHTML**
```bash
grep -rn --include="*.tsx" --include="*.ts" "dangerouslySetInnerHTML" src/ 2>/dev/null
```
Check if the value is user-controlled. If sanitized with DOMPurify → MEDIUM. If unsanitized → CRITICAL.
CWE: CWE-79 | OWASP: A03:2021

**B2 — DOM XSS via document.write / innerHTML**
```bash
grep -rn --include="*.ts" --include="*.tsx" -E "(document\.write|\.innerHTML\s*=)" src/ 2>/dev/null
```
CWE: CWE-79 | Severity: HIGH

**B3 — Missing CSP Header**
Check `next.config.ts` for `Content-Security-Policy` in headers config.
```bash
grep -n "Content-Security-Policy\|contentSecurityPolicy" next.config.ts vercel.json 2>/dev/null
```
Missing → MEDIUM. Present but `unsafe-eval` or `*` sources → HIGH.
CWE: CWE-693 | Severity: MEDIUM–HIGH

### Rule Group C: SSRF (HIGH)

**C1 — Unvalidated User-Supplied URLs**
```bash
grep -rn --include="*.ts" -E "fetch\s*\(\s*req\.|fetch\s*\(\s*params\.|fetch\s*\(\s*body\." src/app/api 2>/dev/null
grep -rn --include="*.ts" "fetch\s*\(.*url\|fetch\s*\(.*href\|fetch\s*\(.*link" src/app/api 2>/dev/null
```
CWE: CWE-918 | OWASP: A10:2021 | Severity: HIGH

**C2 — Open Redirect**
```bash
grep -rn --include="*.ts" "redirect\s*\(\|NextResponse\.redirect" src/ 2>/dev/null | grep -v "static\|/login\|/dashboard\|/home"
```
Check if redirect target comes from user input (query params, body).
CWE: CWE-601 | OWASP: A01:2021 | Severity: MEDIUM

### Rule Group D: Authentication / Authorization (CRITICAL)

**D1 — Missing Auth Check on API Route**
For every route in `src/app/api/`:
- Does it call `createClient()` + check auth?
- Does it use the provider access check in `src/app/api/provider/_lib/access.ts`?
- Public routes MUST be intentionally public (documented)
```bash
# Routes that don't check auth
# Note: Routes with a "// @public-route" comment are intentionally unauthenticated — skip those
for f in $(find src/app/api -name "route.ts"); do
  if grep -q "@public-route" "$f" 2>/dev/null; then
    continue  # intentionally public
  fi
  if ! grep -q "getUser\|checkAuth\|verifyToken\|supabase\.auth\|auth()" "$f" 2>/dev/null; then
    echo "POSSIBLE UNAUTH: $f"
  fi
done
```
CWE: CWE-306 | OWASP: A01:2021 | Severity: CRITICAL

**D2 — Insecure JWT Handling**
```bash
grep -rn --include="*.ts" -E "(jwt\.sign|jwt\.verify|jsonwebtoken)" src/ 2>/dev/null
```
Check: algorithm explicitly set? `alg: 'none'` accepted? Weak secret (< 32 chars)?
CWE: CWE-347 | OWASP: A02:2021 | Severity: CRITICAL

**D3 — Broken Object Level Authorization (IDOR)**
For routes with `[id]` params (e.g., `/api/appointments/[id]/route.ts`):
- Does the route verify the authenticated user OWNS that resource?
- Or does it just fetch by ID without ownership check?
```bash
find src/app/api -path "*\[*\]*" -name "route.ts" | xargs grep -l "params\." 2>/dev/null
```
For each: verify `user.id === resource.patient_id` or equivalent.
CWE: CWE-639 | OWASP: A01:2021 | Severity: CRITICAL

**D4 — Privilege Escalation Path**
Check if role changes require additional authorization:
```bash
grep -rn --include="*.ts" -E "(role|isAdmin|is_admin|user_type)" src/app/api --include="route.ts" 2>/dev/null
```
CWE: CWE-269 | OWASP: A01:2021 | Severity: HIGH

### Rule Group E: Sensitive Data Exposure (HIGH)

**E1 — Password / Secret in Logs**
```bash
grep -rn --include="*.ts" "console\.\(log\|error\|warn\)" src/ 2>/dev/null | grep -iE "(password|secret|token|key|otp|pin)"
```
CWE: CWE-532 | Severity: HIGH

**E2 — Stack Traces / Internal Errors Exposed**
```bash
grep -rn --include="*.ts" -E "error\.stack|error\.message" src/app/api 2>/dev/null | grep "NextResponse\|json\|return"
```
User-facing responses should never include raw `error.message` or `error.stack`.
CWE: CWE-209 | Severity: MEDIUM

**E3 — PII in URL Query Params**
```bash
grep -rn --include="*.ts" -E "searchParams\.get\s*\(\s*['\"]?(phone|email|aadhar|pan|dob)" src/ 2>/dev/null
```
CWE: CWE-359 | Severity: MEDIUM

### Rule Group F: Input Validation (HIGH)

**F1 — Missing Zod Schema on API Input**
For every POST/PUT/PATCH route: check for Zod `safeParse` or `parse` of request body.
```bash
# Check that safeParse/parse is called on actual request body data, not just that Zod is imported
for f in $(find src/app/api -name "route.ts"); do
  if grep -q "POST\|PUT\|PATCH" "$f" 2>/dev/null; then
    # Must have safeParse or .parse( called on body/formData/json result, not just a z. import
    if ! grep -qE "\.(safeParse|parse)\s*\(" "$f" 2>/dev/null; then
      echo "MISSING VALIDATION: $f"
    fi
  fi
done
```
CWE: CWE-20 | OWASP: A03:2021 | Severity: HIGH

**F2 — File Upload Without Validation**
```bash
grep -rn --include="*.ts" "formData\|multipart\|upload\|\.file\b" src/app/api 2>/dev/null
```
Check: type validation, size limit, extension check.
CWE: CWE-434 | Severity: HIGH

### Rule Group G: Cryptography (HIGH)

**G1 — Weak Hash / Insecure Crypto**
```bash
grep -rn --include="*.ts" -E "(md5|sha1|createHash\(['\"]md5|createHash\(['\"]sha1)" src/ 2>/dev/null | grep -v "test\|spec"
```
CWE: CWE-327 | Severity: MEDIUM–HIGH (CRITICAL if used for passwords)

**G2 — Weak Random Number Generation**
```bash
grep -rn --include="*.ts" "Math\.random\(\)" src/ 2>/dev/null | grep -v "test\|spec\|mock"
```
If used for tokens, OTPs, or session IDs → CRITICAL. Use `crypto.randomBytes` instead.
CWE: CWE-338 | Severity: CRITICAL if security-sensitive

**G3 — Hardcoded IV / Salt**
```bash
grep -rn --include="*.ts" -E "(iv\s*=\s*['\"][a-fA-F0-9]{16,}['\"]|salt\s*=\s*['\"][^'\"]{6,}['\"])" src/ 2>/dev/null
```
CWE: CWE-330 | Severity: HIGH

### Rule Group H: Configuration & Security Headers (MEDIUM)

**H1 — Missing Security Headers**
Check `next.config.ts` headers for:
- `X-Frame-Options` or `frame-ancestors` CSP directive
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

**H2 — CORS Misconfiguration**
```bash
grep -rn --include="*.ts" -E "(Access-Control-Allow-Origin|cors\s*\(|origin\s*:\s*['\"]?\*)" src/ 2>/dev/null
```
Wildcard `*` on endpoints that handle cookies or auth → CRITICAL.
CWE: CWE-942 | Severity: HIGH

**H3 — Rate Limiting Absent**
Check all auth endpoints (`/api/auth/otp/send`, `/api/auth/otp/verify`) for rate limiting.
```bash
grep -rn "rate.limit\|rateLimit\|throttle" src/app/api/auth 2>/dev/null
```
Missing on OTP endpoints → HIGH (brute force risk).
CWE: CWE-307 | Severity: HIGH

### Rule Group I: Prototype Pollution & Mass Assignment (MEDIUM)

**I1 — Prototype Pollution**
```bash
grep -rn --include="*.ts" -E "Object\.assign\s*\(\s*\{\s*\}\s*,|merge\s*\(\s*\{|deepMerge\s*\(" src/ 2>/dev/null | grep -v "test"
```
Flag if user-controlled input flows into object spread/assign without key filtering.
CWE: CWE-1321 | Severity: MEDIUM

**I2 — Mass Assignment**
```bash
grep -rn --include="*.ts" -E "\.update\s*\(\s*body\b|\.create\s*\(\s*body\b|\.insert\s*\(\s*body\b" src/app/api 2>/dev/null
```
If raw request body passed to DB update → HIGH (user can set `role`, `is_admin`, etc.).
CWE: CWE-915 | Severity: HIGH

---

## Phase 4: Shannon Attack Domain Analysis

Apply Shannon's 5-domain pentest framework as white-box analysis. For each domain, trace from entry point to sink.

### Domain A: Injection Attack Analysis

**Data Flow Trace Protocol:**
1. Identify all user-controlled sources: `req.json()`, `searchParams`, `params`, headers
2. Trace each source through the call graph
3. Flag any path where user data reaches a sink without sanitization

**Sinks to trace to:**
- Database: `supabase.from().select()/insert()/update()/delete()`, raw `.rpc()`
- OS: `exec`, `spawn`, `child_process`
- HTML: `dangerouslySetInnerHTML`, `innerHTML`
- URLs: `fetch()`, `axios.get()`, `redirect()`
- File system: `fs.readFile()`, `fs.writeFile()`, `path.join()`

**India-specific injection surface for bookphysio:**
- Phone numbers passed to MSG91 API → verify no injection in SMS templates
- Pincode/location data passed to search queries
- Provider ICP registration numbers in queries
- Razorpay payment amounts (ensure server-computed, not user-supplied)

### Domain B: XSS Attack Analysis

**Stored XSS Vectors:**
- Patient notes, SOAP notes stored in DB → rendered in provider dashboard
- Provider bio/description → rendered on public provider pages
- Review/rating text → rendered in patient-facing UI
- Appointment notes → rendered in multiple contexts

**Reflected XSS Vectors:**
- Search query displayed in results page
- Error messages reflecting user input
- URL parameters rendered without encoding

**Verification:** For each stored user input, trace from DB read → React render. React auto-escapes by default, but `dangerouslySetInnerHTML` bypasses this.

### Domain C: SSRF Attack Analysis

**bookphysio-specific SSRF surface:**
- Any endpoint that accepts a URL parameter (profile images, document links)
- Razorpay webhook signature verification — does it re-fetch anything?
- MSG91 callback URLs
- Any API route that proxies external content
- Provider profile image URLs — are they fetched server-side?

**Shannon SSRF test criteria:**
- Can the URL point to `169.254.169.254` (AWS metadata)?
- Can the URL point to `localhost` or internal services?
- Is there a URL allowlist/denylist?

### Domain D: Authentication & Authorization Analysis

**Shannon auth attack vectors for bookphysio:**

1. **OTP Bypass:**
   - Can OTP be guessed (4-6 digits)? Is there brute force protection?
   - Check `src/lib/auth/otp-rate-limit.ts` — is it enforced server-side?
   - Dev OTP (`src/lib/auth/dev-otp.ts`) — is it disabled in production?
   - Is OTP time-limited? (max 5-10 min standard)

2. **Session Fixation:**
   - Is session rotated on login?
   - Can an attacker pre-set a session ID?

3. **JWT/Token Attacks:**
   - Supabase tokens — are they validated server-side on every request?
   - Can a patient impersonate a provider by changing `user_type` in token claims?

4. **IDOR Exploitation Paths:**
   - Patient accessing another patient's appointments: `/api/appointments/[id]`
   - Provider accessing another provider's patients: `/api/provider/patients/[id]`
   - Patient accessing provider SOAP notes directly

5. **Privilege Escalation:**
   - Can a patient become a provider without admin approval?
   - Can a provider access admin endpoints?

### Domain E: Business Logic Analysis

**bookphysio-specific invariants (Shannon-style invariant discovery):**

1. **Payment Invariant**: Payment amount MUST be server-computed. Never trust client-supplied amount.
   - Verify: `/api/payments/create-order` — where does `amount` come from?
   - Attack: Can I create a booking for ₹1 by manipulating the order creation request?

2. **Appointment Double-Booking Invariant**: A provider slot cannot be double-booked.
   - Race condition risk: Two patients booking same slot simultaneously
   - Verify: Is there a DB-level unique constraint or `FOR UPDATE` lock?

3. **Refund Invariant**: Only the original payer can request a refund for their booking.
   - Verify: `/api/payments/refund` — checks patient ownership?

4. **Provider Access Invariant**: Providers can only access their own patients' data.
   - Verify: Every provider API route checks `provider.id === appointment.provider_id`

5. **Review Authenticity Invariant**: Only patients who completed a session can leave a review.
   - Verify: Review creation checks appointment completion status?

6. **Subscription Invariant**: Free tier limits cannot be bypassed by concurrent requests.
   - Race condition: Multiple simultaneous bookings to bypass monthly limit?

**Attack Chains (multi-step exploitation):**
Document any multi-step exploit that chains 2+ findings:
- Example: IDOR → Read another patient's PII → Targeted phishing
- Example: Mass Assignment → Elevate to provider → Access all patient data
- Example: OTP bypass → Account takeover → Payment fraud

---

## Phase 5: Scoring & Compliance

### Risk Score Calculation (Shield formula)

```
Score = max(0, 100 - Penalties)

CRITICAL findings  × 15 points each
HIGH     findings  × 8  points each
MEDIUM   findings  × 3  points each
LOW      findings  × 1  point each

Risk Levels:
  90-100 → LOW RISK      ✅ Maintain current posture
  70-89  → MEDIUM RISK   ⚠️ Action recommended
  40-69  → HIGH RISK     🔴 Remediation needed
  0-39   → CRITICAL RISK 🚨 Immediate action required

Edge cases:
  - If total penalties ≥ 100 the score floors at 0 (CRITICAL RISK regardless)
  - A score of 0 with many findings does NOT mean "equally bad" — show raw penalty total
    e.g., "Score: 0/100 (penalty: 185 points — 7 CRITICAL, 8 HIGH)"
  - Finding severity is determined by actual exploitability/impact, NOT by npm version bump type.
    A PATCH release can contain a CRITICAL CVE; always use the published CVE severity (CVSS score).
```

### Compliance Mapping

Map each finding to applicable frameworks:

| Framework | Relevant Controls for bookphysio |
|-----------|----------------------------------|
| **SOC 2** | CC6.1 (Logical Access) · CC6.3 (RBAC) · CC6.7 (Data-in-Transit) · CC6.8 (Input Controls) · CC7.1 (System Monitoring) |
| **PCI-DSS** | Req 6.5 (Secure Dev) · Req 7.1 (Access Control) · Req 11.3 (Pen Testing) — relevant if storing payment data |
| **HIPAA** | §164.312(a)(1) (Access Control) · §164.312(c)(1) (Integrity) · §164.312(e)(1) (Transmission Security) — if health records stored |
| **India IT Act** | Sec 43A (Reasonable Security Practices) · SPDI Rules (Sensitive Personal Data) |

---

## Phase 6: Report Generation

### Structured Finding Format

```json
{
  "id": "BP-001",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
  "title": "Short finding title",
  "cwe": "CWE-89",
  "owasp": "A03:2021",
  "source": "npm-audit|secrets-scan|sast|shannon-auth|shannon-injection|shannon-xss|shannon-ssrf|shannon-biz-logic",
  "file": "src/app/api/...",
  "line": 42,
  "evidence": "The exact code or pattern that triggered this finding",
  "impact": "What an attacker can do if this is exploited",
  "recommendation": "Specific fix with code example",
  "compliance": ["SOC2-CC6.1", "PCI-DSS-6.5", "HIPAA-164.312"],
  "attack_chain": "Can be chained with BP-003 to achieve full account takeover",
  "fix_diff": "--- before\n+++ after\n..."
}
```

### Report Sections

1. **Executive Summary** — Score, risk level, critical count, top 3 issues
2. **Security Scorecard** — Score breakdown with bar visualization
3. **Findings by Severity** — CRITICAL → HIGH → MEDIUM → LOW → INFO
4. **Attack Surface Map** — API routes, auth flows, external integrations
5. **Attack Chains** — Multi-step exploitation narratives
6. **Dependency Audit** — CVEs + outdated packages
7. **Fix Proposals** — Before/after diffs for each finding
8. **Compliance Status** — SOC 2, PCI-DSS, HIPAA, India IT Act mapping
9. **Tool Coverage** — Which tools ran, which were skipped, coverage gaps
10. **Baseline Delta** — New vs resolved vs persistent findings (if baseline exists)
11. **Next Steps** — Prioritized remediation roadmap

### Baseline Tracking

Save scan summary to `.claude/security-baseline.json`:
```json
{
  "scan_date": "ISO 8601",
  "score": 0,
  "findings": { "critical": 0, "high": 0, "medium": 0, "low": 0 },
  "finding_ids": []
}
```

On next scan, compare against baseline to show:
- 🆕 New findings since last scan
- ✅ Resolved since last scan
- ⚠️ Persistent (unresolved)
- 📈 Score delta

---

## Modes

| Mode | What Runs | When to Use |
|------|-----------|-------------|
| `quick` | SCA + Secrets + SAST Phase 3 only | PR review, fast checks |
| `full` | All 6 phases | Release gate, monthly audits |
| `pentest` | Phase 1 + Phase 4 (Shannon domains) only | Auth/logic focus |
| `fix` | Re-analyze findings, generate diffs | After identifying issues |
| `verify` | Full scan + baseline comparison | After applying fixes |
| `score` | Load last baseline, calculate score | Quick posture check |
| `outdated` | npm outdated only | Dependency maintenance |
| `sast` | Phase 3 only (AI static analysis) | Code review augmentation |

---

## India / bookphysio Specific Rules

These rules are specific to this platform and not covered by generic scanners:

| ID | Check | Severity |
|----|-------|----------|
| BP-INDIA-01 | Razorpay amount server-computed (never trust client) | CRITICAL |
| BP-INDIA-02 | GST 18% computed server-side, not user-supplied | HIGH |
| BP-INDIA-03 | Phone numbers validated as E.164 with +91 prefix | MEDIUM |
| BP-INDIA-04 | Pincode validated as 6-digit regex `/^[1-9][0-9]{5}$/` | LOW |
| BP-INDIA-05 | MSG91 OTP — brute force protection (max 3 attempts) | CRITICAL |
| BP-INDIA-06 | Dev OTP endpoint disabled in production env | CRITICAL |
| BP-INDIA-07 | Provider ICP registration number validated before approval | MEDIUM |
| BP-INDIA-08 | Patient PII (phone, Aadhaar) not logged | HIGH |
| BP-INDIA-09 | Appointment slot booking has race condition protection | HIGH |
| BP-INDIA-10 | Refund only processable by original paying patient | CRITICAL |

---

## Tool Availability Matrix

| Tool | Status Check | Fallback |
|------|-------------|---------|
| `npm audit` | `npm --version` | Skip — note in report |
| `npm outdated` | Always available | — |
| `git` | `git --version` | Skip secrets history scan |
| `semgrep` | `semgrep --version` | AI SAST (Phase 3) covers this |
| `gitleaks` | `gitleaks version` | grep pattern library (Phase 2.3) |
| `trivy` | `trivy --version` | Skip — note in report |
| Shannon CLI | `npx @keygraph/shannon --version` | AI pentest analysis (Phase 4) covers this |

Graceful degradation: run whatever is available, note gaps, use AI analysis to fill gaps where possible.

---

## Integration with Existing Agents

After the scan completes:
- If CRITICAL findings: immediately invoke `security-reviewer` agent for deep analysis
- If auth issues: invoke `security-reviewer` with focus on auth files
- If DB issues: invoke `database-reviewer` with focus on RLS policies
- Document findings in `docs/planning/ACTIVE.md` as urgent tasks
