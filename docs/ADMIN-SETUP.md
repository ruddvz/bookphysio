# Admin Account Setup — BookPhysio.in

> How to create and manage admin accounts via the Supabase Dashboard.

---

## Prerequisites

- Access to your Supabase project dashboard
- The project URL follows this pattern:
  ```text
  https://supabase.com/dashboard/project/<your-project-ref>
  ```

---

## Creating an Admin Account

### Step 1: User signs up normally

The user must first create a regular account through the BookPhysio signup flow (`/signup` or `/login`). This creates their entry in Supabase Auth and the `users` table.

### Step 2: Update the role in Supabase Dashboard

1. Open your Supabase project dashboard
2. Navigate to **Table Editor** → select the `users` table
3. Find the user row by their email or phone number
4. Edit the `role` column value from `patient` to `admin`
5. Save the row

### Step 3: Verify access

The user can now:
- Access `/admin` — Platform overview dashboard
- Access `/admin/listings` — Provider approval queue
- Access `/admin/users` — User management
- Access `/admin/analytics` — Platform analytics

---

## Role Values

| Role       | Value      | Access                          |
|------------|------------|---------------------------------|
| Patient    | `patient`  | `/patient/*` routes             |
| Provider   | `provider` | `/provider/*` routes            |
| Admin      | `admin`    | `/admin/*` routes + all APIs    |

---

## Security Notes

- The middleware (`src/middleware.ts`) enforces role-based access on every request
- Admin API routes (`/api/admin/*`) independently verify the `admin` role server-side
- There is no self-service admin promotion — it must be done via the Supabase Dashboard
- The `SUPABASE_SERVICE_ROLE_KEY` (used by `supabaseAdmin`) bypasses RLS for admin queries

---

## Revoking Admin Access

To remove admin access, change the `role` column back to `patient` in the Supabase Dashboard. The change takes effect on the user's next request.
