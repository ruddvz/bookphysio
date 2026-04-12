# MSG91 + Supabase OTP Setup Guide for BookPhysio.in

> **Complete step-by-step guide.** Follow every step in order. Each step tells you exactly where to click and what to paste.
>
> **Time estimate:** ~30 minutes of your time + 2–7 business days waiting for DLT approvals.

---

## How OTP Works in This App (Read This First)

```
User clicks "Send OTP"
        ↓
Your Next.js app calls: supabase.auth.signInWithOtp({ phone })
        ↓
Supabase Auth receives the request
        ↓
Supabase fires the "Send SMS Hook" to your Edge Function
        ↓
Your Edge Function calls MSG91's API with the OTP code
        ↓
MSG91 delivers the SMS to the user's phone via DLT-approved template
        ↓
User enters the OTP code
        ↓
Your Next.js app calls: supabase.auth.verifyOtp({ phone, token })
        ↓
Supabase verifies the code → user is logged in ✅
```

**Important:** MSG91 is **NOT** a built-in Supabase SMS provider (unlike Twilio/Vonage/MessageBird). You need a small Supabase Edge Function that acts as a bridge between Supabase Auth and MSG91. Don't worry — this guide walks you through every line.

---

## Table of Contents

1. [MSG91 Account Setup](#step-1-msg91-account-setup)
2. [DLT Registration (Required for India)](#step-2-dlt-registration-required-for-india)
3. [Register Sender ID on DLT Portal](#step-3-register-sender-id-on-dlt-portal)
4. [Register OTP Template on DLT Portal](#step-4-register-otp-template-on-dlt-portal)
5. [Add Sender ID & Template in MSG91](#step-5-add-sender-id--template-in-msg91)
6. [Install Supabase CLI](#step-6-install-supabase-cli)
7. [Create the Edge Function](#step-7-create-the-edge-function)
8. [Deploy the Edge Function](#step-8-deploy-the-edge-function)
9. [Configure the Supabase Send SMS Hook](#step-9-configure-the-supabase-send-sms-hook)
10. [Enable Phone Auth in Supabase](#step-10-enable-phone-auth-in-supabase)
11. [Set Vercel Environment Variables](#step-11-set-vercel-environment-variables)
12. [Test Everything](#step-12-test-everything)
13. [Troubleshooting](#troubleshooting)

---

## Step 1: MSG91 Account Setup

You said you already have an MSG91 account. Let's get the Auth Key.

### 1.1 Get Your Auth Key

1. Go to **https://msg91.com** and log in
2. Click your **profile icon** (top-right corner)
3. Click **"API Keys"** or go directly to: **https://control.msg91.com/app/assets/key**
4. You'll see your Auth Key listed. It looks something like:
   ```
   407026AxxxxxxxxxxxxxxxxP682b48xxx
   ```
5. **Copy this key and save it somewhere safe** (you'll paste it later into the Edge Function)

> ⚠️ If you don't see an Auth Key, click **"Create New"** to generate one.

### 1.2 Verify Your MSG91 Account

1. Make sure your account is **verified** (email + phone verified)
2. If MSG91 asks for KYC documents, complete that process
3. Check your account has SMS credits (MSG91 gives some free credits for testing)

**Save these for later:**
| Item | Your Value | Example |
|------|-----------|---------|
| MSG91 Auth Key | _________________ | `407026AxxxxxxxxxxxxxxxxP682b48xxx` |

---

## Step 2: DLT Registration (Required for India)

> **What is DLT?** India's TRAI requires ALL SMS senders to register on a DLT (Distributed Ledger Technology) platform. Without this, your OTPs will be **blocked by telecom carriers** and never delivered.

### 2.1 Choose a DLT Portal

Pick **ONE** of these portals. They all do the same thing — pick whichever you prefer:

| Portal | URL | Good For |
|--------|-----|----------|
| **Jio TrueConnect** | https://trueconnect.jio.com | Most popular choice |
| **Vilpower (Vodafone-Idea)** | https://www.vilpower.in | Also popular, good UI |
| **Airtel** | https://www.airtel.in/business/commercial-communication | If you use Airtel |
| **BSNL** | https://www.ucc-bsnl.co.in | Government option |

> **Recommendation:** Use **Jio TrueConnect** or **Vilpower** — they have the best dashboards and fastest approvals.

### 2.2 Register as an Enterprise

1. Go to your chosen DLT portal
2. Click **"Register"** or **"Sign Up"**
3. Select **"Enterprise"** (you are a Content Sender, not a Telemarketer)
4. Fill in the registration form:

| Field | What to Enter |
|-------|--------------|
| **Entity Type** | Enterprise |
| **Company Name** | Your company/individual name |
| **Email** | Your business email |
| **Phone** | Your phone number |
| **PAN Number** | Your PAN (individual or company) |
| **GST Number** | Your GSTIN (if you have one). If you don't have GST, select "Exempted" and upload an exemption letter |
| **Category** | Healthcare / Technology |
| **Address** | Your business address |

5. **Upload documents:**
   - PAN card copy (scanned PDF or image)
   - GST certificate (or exemption letter on letterhead)
   - Authorization letter on company letterhead (stating you authorize SMS sending)
   - Aadhaar or other ID proof

6. Submit the form
7. **Wait for approval — this takes 2–7 business days**
8. You'll receive an email when approved

> 💡 **While waiting for DLT approval**, you can continue with Steps 6–8 (installing Supabase CLI and creating the Edge Function). Come back to Steps 3–5 after DLT approval.

**Save these for later:**
| Item | Your Value |
|------|-----------|
| DLT Entity ID | _________________ |
| DLT Portal Used | _________________ |

---

## Step 3: Register Sender ID on DLT Portal

> **Do this after your DLT entity registration is approved.**

A Sender ID is the 6-character name that appears as the SMS sender on the user's phone (e.g., `BKPHYS`).

### 3.1 Create the Sender ID

1. Log into your DLT portal (the one you chose in Step 2)
2. Go to **"Headers"** or **"Sender IDs"** section
3. Click **"Add New Header"** or **"Register New"**
4. Fill in:

| Field | What to Enter |
|-------|--------------|
| **Header / Sender ID** | `BKPHYS` (or any 6-character alphanumeric name for your brand) |
| **Header Type** | Transactional |
| **Category** | Healthcare / Technology |

5. Submit for approval
6. **Wait 1–3 business days** for approval
7. You'll get an email or see the status change to "Approved" in the portal

**Rules for Sender IDs:**
- Must be exactly **6 characters** (letters and numbers only)
- Must represent your brand
- Cannot be a common word (e.g., `INFORM`, `ALERTS`)

**Save for later:**
| Item | Your Value | Example |
|------|-----------|---------|
| Sender ID | _________________ | `BKPHYS` |

---

## Step 4: Register OTP Template on DLT Portal

> **Do this after your Sender ID is approved.**

### 4.1 Create the OTP Template

1. In your DLT portal, go to **"Templates"** or **"Content Templates"**
2. Click **"Add New Template"**
3. Fill in:

| Field | What to Enter |
|-------|--------------|
| **Template Name** | BookPhysio OTP Verification |
| **Template Type** | **Transactional** (NOT Promotional) |
| **Communication Type** | Service Implicit (OTP messages don't need consent) |
| **Associated Header** | Select your approved Sender ID (`BKPHYS`) |
| **Template Content** | Copy-paste the exact text below ↓ |

**Template text to paste:**

> ⚠️ **Before pasting:** Check your DLT portal's documentation for the correct variable placeholder syntax. Different portals use different formats (`{#var#}`, `##VAR##`, `{var}`, etc.). The example below uses `{#var#}` — **replace it with your portal's format.**

```
Your BookPhysio verification code is {#var#}. Do not share this code. It expires in 10 minutes.
```

> This is where the OTP number will go. The rest of the text (everything except the placeholder) must stay **character-for-character identical** to avoid DLT rejection.

4. Submit for approval
5. **Wait 1–3 business days** for approval
6. After approval, you'll get a **DLT Template ID** — it looks like: `1107XXXXXXXXXXXX` (a long number)

**Save for later:**
| Item | Your Value | Example |
|------|-----------|---------|
| DLT Template ID | _________________ | `1107161234567890` |

---

## Step 5: Add Sender ID & Template in MSG91

> **Do this after both your Sender ID and Template are approved on the DLT portal.**

### 5.1 Add Sender ID in MSG91

1. Log into MSG91: **https://control.msg91.com**
2. Go to **Sender ID** (in the left sidebar, under "Configuration" or "Settings")
   - Direct link: **https://control.msg91.com/app/assets/sender-id**
3. Click **"Add Sender ID"**
4. Fill in:

| Field | What to Enter |
|-------|--------------|
| **Country** | India |
| **Sender ID** | Your approved DLT Sender ID (e.g., `BKPHYS`) |
| **DLT Entity ID** | Your DLT Entity ID from Step 2 |
| **Company Name** | Your company name |

5. Click **Save**

### 5.2 Add OTP Template in MSG91

1. In MSG91, go to **OTP** in the left sidebar
   - Or go to: **https://control.msg91.com/app/otp**
2. Click **"Add Template"** or **"Create Template"**
3. Fill in:

| Field | What to Enter |
|-------|--------------|
| **Template Name** | BookPhysio OTP |
| **Sender ID** | Select your Sender ID (`BKPHYS`) |
| **DLT Template ID** | Paste your DLT Template ID from Step 4 (e.g., `1107161234567890`) |
| **Template Body** | See below ↓ |

**Template body to paste (must match your DLT template character-for-character, except the variable placeholder which becomes `{{otp}}` in MSG91):**
```
Your BookPhysio verification code is {{otp}}. Do not share this code. It expires in 10 minutes.
```

> **KEY DIFFERENCE:** In MSG91, you use `{{otp}}` instead of `{#var#}` (or your DLT portal's placeholder). MSG91 automatically maps `{{otp}}` to the DLT variable. **Everything else in the text must be identical** to your DLT-approved template — even spaces and punctuation.

4. Set **OTP Length** to `6`
5. Set **OTP Expiry** to `600` seconds (10 minutes) — or `300` (5 minutes) if you prefer shorter
6. Click **Save**

After saving, MSG91 will show you a **Template ID**. This is the MSG91 Template ID.

**Save for later:**
| Item | Your Value | Example |
|------|-----------|---------|
| MSG91 Template ID | _________________ | `6XXXXXXXXXXXXXXX` or `global_otp` |
| MSG91 Auth Key | _________________ | `407026AxxxxxxxxxxxxxxxxP682b48xxx` |
| Sender ID | _________________ | `BKPHYS` |

---

## Step 6: Install Supabase CLI

You need the Supabase CLI to create and deploy the Edge Function.

### On Mac:
```bash
brew install supabase/tap/supabase
```

### On Windows (PowerShell):
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### On Linux:
```bash
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | bash
```

### Or with npm (any platform):
```bash
npm install -g supabase
```

### Verify Installation:
```bash
supabase --version
```
You should see something like `2.x.x`.

### Log In to Supabase CLI:
```bash
supabase login
```
This opens your browser — log in with your Supabase account and authorize the CLI.

---

## Step 7: Create the Edge Function

This Edge Function receives OTP requests from Supabase Auth and forwards them to MSG91.

### 7.1 Link Your Project

Open a terminal in your `bookphysio` project folder:

```bash
cd /path/to/bookphysio
```

Link your Supabase project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

> **Where to find your Project Ref:** Go to Supabase Dashboard → Settings → General → Reference ID. It looks like `abcdefghijklmnop`.

### 7.2 Create the Function

```bash
supabase functions new send-sms
```

This creates a file at `supabase/functions/send-sms/index.ts`.

### 7.3 Replace the Function Code

Open `supabase/functions/send-sms/index.ts` and **replace everything** with this code:

```typescript
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

// MSG91 Flow API endpoint
const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow/";

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Read environment variables
  const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
  const msg91AuthKey = Deno.env.get("MSG91_AUTH_KEY");
  const msg91TemplateId = Deno.env.get("MSG91_TEMPLATE_ID");
  const msg91SenderId = Deno.env.get("MSG91_SENDER_ID");

  // Validate all required env vars are present
  // (msg91SenderId is optional — some MSG91 setups don't require it)
  if (!hookSecret || !msg91AuthKey || !msg91TemplateId) {
    console.error("Missing required environment variables");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Verify the webhook signature from Supabase
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  const wh = new Webhook(hookSecret);

  let data: { user: { phone: string }; sms: { otp: string } };

  try {
    data = wh.verify(payload, headers) as typeof data;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Extract phone number and OTP from the verified payload
  const { user, sms } = data;
  const phoneNumber = user.phone;
  const otpCode = sms.otp;

  // Clean the phone number — MSG91 expects country code + number without "+"
  // e.g., "+919876543210" → "919876543210"
  // Supabase Auth already validates E.164 format, so we only strip the "+" prefix
  const cleanPhone = phoneNumber.replace(/^\+/, "");

  console.log(`Sending OTP to ${cleanPhone.slice(0, 4)}****${cleanPhone.slice(-2)}`);

  // Call MSG91 Flow API to send the OTP
  try {
    const msg91Response = await fetch(MSG91_FLOW_URL, {
      method: "POST",
      headers: {
        "authkey": msg91AuthKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        template_id: msg91TemplateId,
        // Only include sender if configured (optional for some MSG91 setups)
        ...(msg91SenderId ? { sender: msg91SenderId } : {}),
        short_url: "0",
        recipients: [
          {
            mobiles: cleanPhone,
            // "otp" maps to the {{otp}} variable in your MSG91 template
            otp: otpCode,
          },
        ],
      }),
    });

    const msg91Result = await msg91Response.json();
    console.log("MSG91 response:", JSON.stringify(msg91Result));

    if (!msg91Response.ok) {
      console.error("MSG91 API error:", msg91Result);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Success — return empty JSON object (Supabase expects this)
    return new Response(
      JSON.stringify({}),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Failed to call MSG91:", err);
    return new Response(
      JSON.stringify({ error: "SMS delivery failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

> **Don't change anything in this code** — just save it as-is.

---

## Step 8: Deploy the Edge Function

### 8.1 Set the Function's Environment Variables (Secrets)

Run these commands one by one. Replace the placeholder values with your actual credentials before running each command:

```bash
supabase secrets set MSG91_AUTH_KEY=YOUR_MSG91_AUTH_KEY_HERE
```
Replace `YOUR_MSG91_AUTH_KEY_HERE` with your actual Auth Key from Step 1 (e.g., `407026AxxxxxxxxxxxxxxxxP682b48xxx`).

```bash
supabase secrets set MSG91_TEMPLATE_ID=YOUR_MSG91_TEMPLATE_ID_HERE
```
Replace `YOUR_MSG91_TEMPLATE_ID_HERE` with the Template ID from Step 5 (e.g., `6XXXXXXXXXXXXXXX`).

```bash
supabase secrets set MSG91_SENDER_ID=YOUR_SENDER_ID_HERE
```
Replace `YOUR_SENDER_ID_HERE` with your Sender ID from Step 3 (e.g., `BKPHYS`).

> ⚠️ Don't set `SEND_SMS_HOOK_SECRET` yet — that comes from Supabase in Step 9.

### 8.2 Deploy the Function

```bash
supabase functions deploy send-sms --no-verify-jwt
```

> **`--no-verify-jwt` is required** because Supabase Auth calls this function directly using webhook signatures, not JWT tokens.

After deploying, you'll see output like:
```
Function send-sms deployed successfully.
Endpoint URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-sms
```

**Copy this Endpoint URL — you'll need it in Step 9.**

**Save for later:**
| Item | Your Value | Example |
|------|-----------|---------|
| Edge Function URL | _________________ | `https://abcdefgh.supabase.co/functions/v1/send-sms` |

---

## Step 9: Configure the Supabase Send SMS Hook

### 9.1 Open the Hooks Page

1. Go to **https://supabase.com/dashboard**
2. Select your BookPhysio project
3. Go to **Authentication** → **Hooks** (in the left sidebar)
   - Direct URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF/auth/hooks`

### 9.2 Add the Send SMS Hook

1. Find the **"Send SMS"** hook
2. Click **"Enable Hook"** (or the toggle to turn it on)
3. Configure:

| Field | What to Enter |
|-------|--------------|
| **Hook Type** | HTTPS |
| **URL** | Paste your Edge Function URL from Step 8 (e.g., `https://abcdefgh.supabase.co/functions/v1/send-sms`) |
| **HTTP Method** | POST |

4. Click **"Generate Secret"** — this creates a webhook signing secret
5. **IMPORTANT: Copy the generated secret immediately** — it looks like: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
6. Click **"Create Hook"** or **"Save"**

### 9.3 Set the Hook Secret in Your Edge Function

Now go back to your terminal and run:

```bash
supabase secrets set SEND_SMS_HOOK_SECRET=whsec_YOUR_HOOK_SECRET_HERE
```

Replace `whsec_YOUR_HOOK_SECRET_HERE` with the secret you just copied from the Supabase dashboard.

### 9.4 Redeploy the Function (to pick up the new secret)

```bash
supabase functions deploy send-sms --no-verify-jwt
```

---

## Step 10: Enable Phone Auth in Supabase

### 10.1 Enable the Phone Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **"Phone"** in the list
3. Toggle it **ON** (enable)
4. You do NOT need to fill in any SMS provider fields (Twilio/MessageBird/etc.) — the Send SMS Hook handles everything
5. Click **Save**

### 10.2 Configure Auth URLs

1. Go to **Authentication** → **URL Configuration**
2. Set:

| Field | Value |
|-------|-------|
| **Site URL** | `https://bookphysio.in` |

3. Under **Redirect URLs**, click **"Add URL"** and enter:
```
https://bookphysio.in/**
```

4. Click **Save**

---

## Step 11: Set Vercel Environment Variables

Go to **Vercel** → your BookPhysio project → **Settings** → **Environment Variables**.

### 11.1 Required Variables

Add or verify each of these. For each one, check **✅ Production**, **✅ Preview**, **✅ Development**:

| Variable Name | Where to Get the Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → **Project URL** (e.g., `https://abcdefgh.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public** key (long JWT string) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** key (long JWT string, keep this SECRET) |
| `NEXT_PUBLIC_APP_URL` | `https://bookphysio.in` |
| `NEXT_PUBLIC_SITE_URL` | `https://bookphysio.in` |
| `OTP_PENDING_COOKIE_SECRET` | Generate fresh — see below ↓ |

### 11.2 Generate the Cookie Secret

Run this command in your terminal:

```bash
openssl rand -base64 32
```

It outputs something like: `xK7m+Q3pR8dL2nWvF5hYj9sA0bCeGtIu4kM6oN1qXz=`

Copy that output and paste it as the value for `OTP_PENDING_COOKIE_SECRET` in Vercel.

> ⚠️ **Never reuse a secret that was pasted in chat, GitHub issues, or anywhere public. Always generate a fresh one.**

### 11.3 Trigger a Fresh Vercel Deploy

Vercel doesn't apply new env vars to existing deployments. After adding variables:

1. Go to **Vercel** → **Deployments** tab
2. Find the most recent production deployment
3. Click the **⋮** (three dots) menu → **Redeploy**
4. Wait for it to finish

---

## Step 12: Test Everything

### 12.1 Test the Edge Function (from Supabase Dashboard)

1. Go to **Authentication** → **Providers** → **Phone**
2. Look for a **"Send test OTP"** option
3. Enter your real phone number: `+919876543210` (your actual number)
4. Click **Send**
5. Check your phone — you should receive an SMS

### 12.2 Test from the Live Site

1. Go to `https://bookphysio.in`
2. Click **Login** or **Sign Up**
3. Enter your 10-digit Indian mobile number (do not include `+91`; the app adds it automatically)
4. Click **Send OTP**
5. Wait for SMS
6. Enter the OTP code
7. You should be logged in ✅

### 12.3 Check Edge Function Logs (if SMS doesn't arrive)

```bash
supabase functions logs send-sms --scroll
```

Or in the Supabase Dashboard:
1. Go to **Edge Functions** → **send-sms**
2. Click **Logs** tab
3. Look for error messages

---

## Troubleshooting

### "OTP configuration is unavailable" (503 error)

**Cause:** Missing `OTP_PENDING_COOKIE_SECRET` in Vercel env vars, or stale deployment.

**Fix:**
1. Check Vercel → Settings → Environment Variables → confirm `OTP_PENDING_COOKIE_SECRET` exists
2. Redeploy (Vercel → Deployments → latest → Redeploy)

---

### SMS never arrives (no error in app)

**Cause:** Edge Function or MSG91 issue.

**Fix:**
1. Check Edge Function logs: `supabase functions logs send-sms --scroll`
2. Common errors:
   - `"Webhook verification failed"` → The `SEND_SMS_HOOK_SECRET` doesn't match. Re-copy it from Supabase Dashboard → Auth → Hooks
   - `"Missing required environment variables"` → Run `supabase secrets list` and verify all 4 secrets are set
   - `"MSG91 API error"` → Check the MSG91 error message. Usually means DLT template mismatch or auth key issue

---

### MSG91 returns "Template not found" or "Invalid template"

**Cause:** The template ID in your Edge Function doesn't match what's in MSG91.

**Fix:**
1. Go to MSG91 Dashboard → OTP → your template
2. Copy the exact Template ID
3. Run: `supabase secrets set MSG91_TEMPLATE_ID=CORRECT_TEMPLATE_ID`
4. Redeploy: `supabase functions deploy send-sms --no-verify-jwt`

---

### MSG91 returns "DLT template not approved" or "Sender ID not approved"

**Cause:** Your DLT registrations haven't been approved yet.

**Fix:** Wait for DLT portal approval (check the portal for status). You cannot send SMS in India until DLT approvals are complete.

---

### "Invalid OTP" when entering the code

**Cause:** Usually a cookie/domain mismatch.

**Fix:**
1. Verify `NEXT_PUBLIC_APP_URL` in Vercel matches your actual domain exactly
2. Verify `OTP_PENDING_COOKIE_SECRET` is set in Vercel
3. Make sure you redeployed after adding env vars

---

### OTP works locally but not on production

**Cause:** Environment variables not set for Production environment in Vercel, or stale deployment.

**Fix:**
1. In Vercel → Settings → Environment Variables, make sure each variable has **Production** checked
2. Redeploy after changes

---

## Quick Reference: All Your Secrets in One Place

Fill this in as you complete each step. **DO NOT commit this to git or share it publicly.**

```
MSG91 Auth Key:           ___________________________________
MSG91 Template ID:        ___________________________________
MSG91 Sender ID:          ___________________________________
DLT Entity ID:            ___________________________________
DLT Template ID:          ___________________________________
Edge Function URL:        https://____________.supabase.co/functions/v1/send-sms
Send SMS Hook Secret:     whsec_______________________________
Supabase Project URL:     https://____________.supabase.co
Supabase Anon Key:        ___________________________________
Supabase Service Role:    ___________________________________
OTP Cookie Secret:        ___________________________________
```

---

## What Goes Where — Summary

| Secret/Key | Where It Goes | How to Set It |
|---|---|---|
| MSG91 Auth Key | Supabase Edge Function secrets | `supabase secrets set MSG91_AUTH_KEY=xxx` |
| MSG91 Template ID | Supabase Edge Function secrets | `supabase secrets set MSG91_TEMPLATE_ID=xxx` |
| MSG91 Sender ID | Supabase Edge Function secrets | `supabase secrets set MSG91_SENDER_ID=xxx` |
| Send SMS Hook Secret | Supabase Edge Function secrets | `supabase secrets set SEND_SMS_HOOK_SECRET=whsec_xxx` |
| Supabase Project URL | Vercel env vars | `NEXT_PUBLIC_SUPABASE_URL` |
| Supabase Anon Key | Vercel env vars | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Supabase Service Role Key | Vercel env vars | `SUPABASE_SERVICE_ROLE_KEY` |
| App URL | Vercel env vars | `NEXT_PUBLIC_APP_URL=https://bookphysio.in` |
| Site URL | Vercel env vars | `NEXT_PUBLIC_SITE_URL=https://bookphysio.in` |
| OTP Cookie Secret | Vercel env vars | `OTP_PENDING_COOKIE_SECRET=<generated>` |

> **The Next.js app never touches MSG91 directly.** All MSG91 credentials live in the Supabase Edge Function. The Vercel env vars are for Supabase Auth + the OTP cookie, not for MSG91.

---

## Alternative: Skip DLT for Now (Testing Only)

If you want to test the OTP flow **right now** without waiting for DLT approval, you have two options:

### Option A: Use Supabase's Test Phone Numbers

Supabase supports test phone numbers that bypass SMS entirely:

1. Go to Supabase Dashboard → **Authentication** → **Providers** → **Phone**
2. Scroll to **"Phone Numbers for Testing OTP"**
3. Add a test phone number and a fixed OTP code (e.g., phone: `+919999900001`, OTP: `123456`)
4. Now you can log in with that number and code without any SMS being sent

### Option B: Use Dev OTP (Built into BookPhysio)

The app has a built-in dev bypass (when demo mode is enabled):

Enter only the 10-digit mobile number in the UI; the app automatically prepends `+91`.

- Phone: `9876500001` → patient role (OTP: `123456`)
- Phone: `9876500002` → provider role (OTP: `123456`)
- Phone: `9876500003` → admin role (OTP: `123456`)

This only works when `NEXT_PUBLIC_ENABLE_DEMO=true` is set. **Never enable this in production.**

---

## Checklist

Print this and check off each step:

- [ ] **Step 1:** MSG91 account created, Auth Key copied
- [ ] **Step 2:** DLT entity registration submitted
- [ ] **Step 2:** DLT entity registration **approved**
- [ ] **Step 3:** Sender ID registered on DLT portal
- [ ] **Step 3:** Sender ID **approved**
- [ ] **Step 4:** OTP template registered on DLT portal
- [ ] **Step 4:** OTP template **approved**, Template ID copied
- [ ] **Step 5:** Sender ID added in MSG91
- [ ] **Step 5:** OTP template added in MSG91, MSG91 Template ID copied
- [ ] **Step 6:** Supabase CLI installed, logged in
- [ ] **Step 7:** Supabase project linked
- [ ] **Step 7:** Edge Function code created
- [ ] **Step 8:** MSG91 secrets set in Edge Function
- [ ] **Step 8:** Edge Function deployed
- [ ] **Step 9:** Send SMS Hook enabled in Supabase Dashboard
- [ ] **Step 9:** Hook secret copied and set in Edge Function secrets
- [ ] **Step 9:** Edge Function redeployed
- [ ] **Step 10:** Phone auth enabled in Supabase
- [ ] **Step 10:** Auth URLs configured (Site URL + Redirect URLs)
- [ ] **Step 11:** All Vercel environment variables set
- [ ] **Step 11:** OTP_PENDING_COOKIE_SECRET generated and set
- [ ] **Step 11:** Fresh Vercel deploy triggered
- [ ] **Step 12:** Test OTP received on real phone ✅
- [ ] **Step 12:** Login/Signup flow works on live site ✅

---

*Last updated: 2026-04-12*
