# Physiotherapy User Journey (ZocDoc Based)

Detailed breakdown of the patient journey for booking a Physiotherapist, modeled after ZocDoc's high-fidelity UX.

## 1. Discovery Phase
- **Entry Points:** 
  - Homepage search for "Physical Therapist" or specific conditions (Back Pain, Sports Injury).
  - Specialty landing pages (Physiotherapy / Physical Therapy).
- **Visual Cues:** 
  - Specialty grid with a "Physiotherapist" icon (Activity/Rehab symbol).
  - Trust signals: "Verified Reviews", "Same-day appointments".

## 2. Search & Filter Phase
- **Results Card:** 
  - Doctor photo, name, and "Verified Patient" rating summary.
  - **Availability Grid:** 7-day view showing blocks of appointments (e.g., "15 appts available").
- **PT-Specific Filters:**
  - **Reason for Visit:** Dropdown including:
    - Physical Therapy Consultation
    - Sports Injury
    - Post-Surgery Rehab
    - Back Pain / Neck Pain
    - Arthritis / Joint Pain
  - **Visit Type:** In-person (In-clinic) vs Video (Online).
  - **Distance:** Radius from current location or pincode.

## 3. Provider Evaluation
- **Profile Sections:**
  - **Highlights:** Quick badges for "Excellent wait time", "Highly recommended".
  - **Bio:** Detailed experience, education (BPT/MPT for India), and certifications.
  - **Reviews:** Tabbed view for ratings, filtered by "Most Relevant" or "Highest Rated".
  - **Photos:** Clinic environment and practitioner headshots.
- **Micro-interactions:** 
  - Hovering over a card shows a subtle shadow lift.
  - Clicking a slot opens a quick-booking modal.

## 4. Booking Flow (The "Click-to-Book" Journey)
1. **Slot Selection:** Clicking a specific time on the search card or full profile.
2. **Details Modal:** 
   - Confirming "Reason for Visit".
   - (Optional) Selecting patient status: "New Patient" vs "Returning Patient".
3. **Patient Info Form:** 
   - Email address.
   - Legal First/Last Name.
   - Date of Birth (standard healthcare requirement).
   - Sex (Legal/Medical).
4. **Final Confirmation:** A summary screen with the address, time, and practitioner details.

## 5. Post-Booking
- **Confirmation:** Email/SMS (OTP verification mentioned in TARGET.md).
- **Dashboard:** Upcoming appointments visible in the Patient Dashboard.

## 6. Provider Onboarding & Setup (5-Step Flow)
1. **Account Foundation:** Password creation with strict security rules.
2. **Email Confirmation:** Account activation via sent link.
3. **Identity Verification:** Secure login for practice confirmation.
4. **Goal Selection:** 4-card interactive selection (New Patients, Insurance/Forms, In-person Booking, Home Visits).
5. **Solution Recommendation:** Personalized recommendations for Zocdoc Marketplace vs. Free Booking options.

## Key Assets for BookPhysio
- **Icons:** Spine, Knee, Activity/Pulse, MapPin, Star, Verified badge.
- **Color Palette:** Primary Teal (#00766C) for all interactive elements.
- **Typography:** Inter (Standard) or Sharp Sans (Premium feel).
