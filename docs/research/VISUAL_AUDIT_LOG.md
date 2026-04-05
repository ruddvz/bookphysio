# Visual Audit Log: ZocDoc Clone

This file tracks all screenshots and visual data gathered from ZocDoc.com for the BookPhysio project.

## Homepage

| Breakpoint | Screenshot Path | Observations |
|------------|-----------------|--------------|
| Desktop (1280px) | ![Homepage 1280px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/homepage_1280px_1774739955457.png) | Hero search (double input), Specialty icons (grid), 'Find a doctor' CTA, Trust signals. |
| Tablet (768px) | ![Homepage 768px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/homepage_768px_1774739957427.png) | Search bar stacks, specialty grid becomes 2xN. |
| Mobile (375px) | ![Homepage 375px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/homepage_375px_1774739958511.png) | Compact search, single column layout for sections. Hamburger menu visible. |

## Search Results (Physical Therapist in New York)

| Breakpoint | Screenshot Path | Observations |
|------------|-----------------|--------------|
| Desktop (1280px) | ![Results 1280px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/results_1280px_1774740060264.png) | Doctor cards on left, map on right. Filter bar at top. |
| Tablet (768px) | ![Results 768px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/results_768px_1774740068267.png) | Map hidden, full-width cards. Filters simplified. |
| Mobile (375px) | ![Results 375px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/results_375px_1774740069904.png) | Single column cards, 'View Map' toggle button at bottom. |

## Doctor Profile

| Breakpoint | Screenshot Path | Observations |
|------------|-----------------|--------------|
| Desktop (1280px) | ![Profile 1280px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/profile_1280px_1774740089044.png) | Bio, Address, Reviews. Sticky booking slots on the right. |
| Tablet (768px) | ![Profile 768px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/profile_768px_1774740090607.png) | Slot picker moves above bio. |
| Mobile (375px) | ![Profile 375px](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/profile_375px_1774740091282.png) | Mobile-optimized slot picker (swipeable carousel). |

## Auth Pages

| Page | Screenshot Path | Observations |
|------|-----------------|--------------|
| Login | ![Login Page](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/login_page_1774740114610.png) | Email/OTP focused, simple clean layout. Social login options. |
| Signup| ![Signup Page](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/signup_page_1774740123469.png) | Multi-step feel, focused on user role (Patient/Doctor). |

## Physical Therapist Booking Flow

| Step | Screenshot Path | Observations |
|------|-----------------|--------------|
| Search Results | ![Search Results](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/zocdoc_search_results_1774742221951.png) | Availability grid with 'X appts' clickable tabs. |
| Booking Modal | ![Booking Modal](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/zocdoc_booking_modal_1774742337630.png) | Reason for visit dropdown (Physical Therapy Consultation, Sports Injury, etc.) + Specific time slots. |
| Patient Info | ![Patient Info](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/zocdoc_patient_info_page_1774742361954.png) | Data entry: Email, Full Name, DOB, Sex. 'Log in' option at top. |

## Authenticated Patient Dashboard (Care Home)

| Section | Screenshot Path | Observations |
|---------|-----------------|--------------|
| Care Home | ![Patient Dashboard](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/patient_dashboard_main_1774743344836.png) | Unified view with preventative health guide ('Well Guide') and recent provider shortcuts. |
| Appointments | ![Patient Appointments](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/patient_appointments_empty_1774743369778.png) | Tabbed interface for 'Upcoming' and 'Past' appointments. Features a 'Find a new doctor' primary CTA when empty. |

## Sign-Up & Onboarding Journey

| User Type | Screenshot Path | Observations |
|-----------|-----------------|--------------|
| Patient Step 1 | ![Patient Sign Up 1](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/patient_sign_up_step_1_1774742796730.png) | Fields: Email, First/Last Name, DOB (spinbuttons), Sex. |
| Patient OTP | ![Patient OTP](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/patient_sign_up_otp_1774742944325.png) | 6-digit numeric verification. Link to resend or verify via email. |
## Provider Onboarding Journey (Step-by-Step)

Based on the latest discovery, the Provider onboarding is a structured 5-step process:

1. **Step 1: Account Creation** - User creates a password with complexity requirements (8+ chars, letters, numbers, special chars).
2. **Step 2: Email Confirmation** - An activation link is sent to the registered email address.
3. **Step 3: Verification / Login** - User logs in to confirm the account.
4. **Step 4: Goal Selection** - "How can Zocdoc help your practice?"
   - Get new patients
   - Save time (intake and scheduling admin)
   - Booking availability
   - Virtual visits
5. **Step 5: Product Selection** - Recommendations for Marketplace (Paid) or Google Booking (Free).

| Step | Screenshot | Observations |
|------|------------|--------------|
| Goal Selection | ![Provider Goals](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/provider_goals_selection.png) | 4-card layout with icons and checkboxes. |
| Recommendations| ![Provider Recs](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/provider_recommendations.png) | Detailed list of products with pricing/badges. |

## Authenticated Provider Dashboard (Practice Portal)

| View / Section | Screenshot Path | Observations |
|----------------|-----------------|--------------|
| Dashboard Home | ![Dashboard Home](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/provider_dashboard_home_1774743930917.png) | Top nav (Home, Calendar, Inbox, Performance, Providers, Sponsored). Main body has 'Setup checklist' (Create profile, Add providers, Verify identity) and 'Performance overview' (Bookings, Reviews). |
| Calendar View | ![Calendar View](file:///C:/Users/pvr66/.gemini/antigravity/brain/1116b577-377d-4a00-a165-31761365dc0c/provider_calendar_view_1774743945022.png) | Standard booking interface accessible via top navigation. |
| Provider Management | ![Providers List](file:///C:/Users/pvr66/.gemini/antigravity/brain/tempmediaStorage/media__1774744564880.png) | Shows top-right user dropdown menu (Settings, Features, Support, Sign out). Main table lists practice providers by Name, Status, and Search Score, with an empty state CTA to 'Add a provider'. |
