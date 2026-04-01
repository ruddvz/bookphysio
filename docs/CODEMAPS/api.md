# BookPhysio — API Codemap

> All API routes in `src/app/api/`. Owner: `bp-backend`.

## API Route Index

### Auth

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/auth/signup` | POST | `auth/signup/route.ts` | `auth.ts` signupSchema | `user.ts` UserProfile | Patient + provider signup |
| `/api/auth/otp/send` | POST | `auth/otp/send/route.ts` | `auth.ts` otpSendSchema | — | Send OTP via MSG91 |
| `/api/auth/otp/verify` | POST | `auth/otp/verify/route.ts` | `auth.ts` otpVerifySchema | — | Verify 6-digit OTP |
| `/api/auth/magic-link` | POST | `auth/magic-link/route.ts` | — | — | Email magic-link login |

### Providers

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/providers` | GET | `providers/route.ts` | `search.ts` searchParamsSchema | `search.ts` SearchResponse | Search with filters: specialty, city, visit_type, page, limit |
| `/api/providers/[id]` | GET | `providers/[id]/route.ts` | — | `provider.ts` ProviderDetail | Single provider profile |
| `/api/providers/[id]/availability` | GET | `providers/[id]/availability/route.ts` | — | — | Available slots for date range |
| `/api/providers/[id]/reviews` | GET | `providers/[id]/reviews/route.ts` | — | `review.ts` ReviewCard[] | Paginated reviews |

### Appointments

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/appointments` | POST | `appointments/route.ts` | `booking.ts` createAppointmentSchema | `appointment.ts` | Create appointment |
| `/api/appointments` | GET | `appointments/route.ts` | — | `appointment.ts` AppointmentCard[] | List patient appointments |
| `/api/appointments/[id]` | GET | `appointments/[id]/route.ts` | — | `appointment.ts` | Get single appointment |
| `/api/appointments/[id]` | PATCH | `appointments/[id]/route.ts` | — | — | Cancel appointment |

### Payments (Razorpay — INR only)

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/payments/create-order` | POST | `payments/create-order/route.ts` | `payment.ts` | `payment.ts` PaymentOrder | Create Razorpay order |
| `/api/payments/webhook` | POST | `payments/webhook/route.ts` | `payment.ts` webhookSchema | — | Razorpay webhook → confirms appointment |
| `/api/payments/refund` | POST | `payments/refund/route.ts` | — | — | Initiate refund for cancelled appointment |

### Reviews

| Route | Method | File | Validation Schema | Contract Type |
|-------|--------|------|-------------------|---------------|
| `/api/reviews` | POST | `reviews/route.ts` | `review.ts` createReviewSchema | `review.ts` |

### Messages

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/conversations` | GET | `conversations/route.ts` | `message.ts` getConversationsSchema | `message.ts` ConversationsResponse | Conversation list |
| `/api/messages` | POST | `messages/route.ts` | `message.ts` messageRequestSchema | `message.ts` MessageResponse | Send message / create thread |
| `/api/conversations/[user_id]/messages` | GET | `conversations/[user_id]/messages/route.ts` | `message.ts` getMessagesSchema | `message.ts` MessagesResponse | Thread messages |
| `/api/conversations/[user_id]/read` | POST | `conversations/[user_id]/read/route.ts` | — | — | Mark thread as read |

### Profile

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/profile` | GET/PATCH | `profile/route.ts` | `user.ts` updateSchema | `user.ts` UserProfile | Current user profile |

### AI

| Route | Method | File | Validation Schema | Contract Type | Notes |
|-------|--------|------|-------------------|---------------|-------|
| `/api/ai/motio` | POST | `ai/motio/route.ts` | — | — | Patient AI triage assistant |
| `/api/ai/provider` | POST | `ai/provider/route.ts` | — | — | Provider clinical research assistant |

### Notifications

| Route | Method | File | Contract Type |
|-------|--------|------|---------------|
| `/api/notifications` | GET | `notifications/route.ts` | `notification.ts` NotificationItem[] |
| `/api/notifications/[id]/read` | PATCH | `notifications/[id]/read/route.ts` | — |

### Admin

| Route | Method | File | Notes |
|-------|--------|------|-------|
| `/api/admin/users` | GET | `admin/users/route.ts` | List users (admin only) |
| `/api/admin/listings` | GET/PATCH | `admin/listings/route.ts` | Provider approval queue |
| `/api/admin/stats` | GET | `admin/stats/route.ts` | Platform stats summary |

### Upload

| Route | Method | File | Notes |
|-------|--------|------|-------|
| `/api/upload` | POST | `upload/route.ts` | Credential document upload to Supabase Storage |

## Contracts (`src/app/api/contracts/`)

| File | Types Exported | Used By |
|------|----------------|---------|
| `provider.ts` | ProviderCard, ProviderDetail | search page, doctor profile, DoctorCard |
| `search.ts` | SearchResponse, SearchParams | search page, SearchFilters |
| `appointment.ts` | AppointmentCard, CreateAppointment | booking wizard, patient/provider appointments |
| `payment.ts` | PaymentOrder, WebhookPayload | booking StepPayment, payment routes |
| `review.ts` | ReviewCard, CreateReview | doctor profile reviews, review route |
| `notification.ts` | NotificationItem | notification pages |
| `user.ts` | UserProfile | auth, profile pages |
| `index.ts` | Re-exports all above | Convenience barrel file |

## Validation Schemas (`src/lib/validations/`)

| File | Schemas | Used By |
|------|---------|---------|
| `auth.ts` | signupSchema, loginSchema, otpSendSchema, otpVerifySchema | auth routes, auth pages |
| `booking.ts` | createAppointmentSchema, slotSelectSchema | appointment routes, booking wizard |
| `payment.ts` | createOrderSchema, webhookPayloadSchema | payment routes |
| `provider.ts` | providerProfileSchema, onboardingSchema | provider routes, doctor-signup |
| `review.ts` | createReviewSchema | review routes |
| `search.ts` | searchParamsSchema | provider search route |

## Tests

| File | Covers |
|------|--------|
| `src/app/api/__tests__/providers.test.ts` | Provider search endpoint |
| `src/lib/supabase/__tests__/client.test.ts` | Supabase client creation |
| `src/lib/validations/__tests__/auth.test.ts` | Auth schema validation |
| `src/lib/validations/__tests__/search.test.ts` | Search schema validation |
