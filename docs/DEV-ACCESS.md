# Dev OTP Access

Use these mobile numbers + the fixed OTP on the **/login** page to jump straight
into each dashboard. No real SMS is sent — Supabase / MSG91 are bypassed entirely.

**Active only when demo access is enabled** (`NODE_ENV=development`,
`NODE_ENV=test`, or `NEXT_PUBLIC_ENABLE_DEMO=true`). In production with the flag
off, these numbers fall through to the normal OTP flow.

## Fixed OTP code

```
123456
```

## Phone numbers → dashboard

| Role     | Phone (enter on /login) | Lands on            |
| -------- | ----------------------- | ------------------- |
| Patient  | `9876500001`            | `/patient/dashboard` |
| Provider | `9876500002`            | `/provider/dashboard` |
| Admin    | `9876500003`            | `/admin`             |

The `+91` prefix is added automatically by the login form.

## How to use

1. Open `/login`.
2. Type one of the 10-digit numbers above into the phone field.
3. Click **Send OTP** → you land on `/verify-otp`.
4. Enter `123456` → you're dropped into the matching dashboard with a signed
   demo session cookie (`bp-demo-session`).

## Source

- Phone/OTP table: [`src/lib/auth/dev-otp.ts`](../src/lib/auth/dev-otp.ts)
- Send bypass: [`src/app/api/auth/otp/send/route.ts`](../src/app/api/auth/otp/send/route.ts)
- Verify bypass: [`src/app/api/auth/otp/verify/route.ts`](../src/app/api/auth/otp/verify/route.ts)
