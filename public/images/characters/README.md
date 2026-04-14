# Character Asset Inventory

3D physio character illustrations used throughout BookPhysio. All images should be transparent PNGs, minimum 640×960px (2× for retina).

## Style Guidelines

- **Art style:** 3D rendered, soft/matte finish
- **Clothing:** Medical scrubs in teal (#00766C), white lab coat optional
- **Skin tones:** Diverse — female is medium-brown, male is light. Maintain this diversity.
- **Expressions:** Warm and professional. Think "doctor you'd trust", not exaggerated smiles.
- **Background:** Transparent PNG, full-body or 3/4 body shots
- **Shadows:** Soft drop shadow baked in for depth on any background

## Planned Assets

| Filename | Character | Pose | Used In | Purpose |
|----------|-----------|------|---------|---------|
| `physio-female-welcome.png` | Female | Standing confidently, arms at sides, warm smile, scrubs + stethoscope | How It Works page hero (Patient tab) | Welcoming — "I'm here to help" |
| `physio-male-clipboard.png` | Male | Holding clipboard/tablet, professional posture, slight forward lean | How It Works page hero (Provider tab) | Competence — "manage your practice" |
| `physio-female-presenting.png` | Female | Open palm gesture, presenting/pointing toward content | ProofSection trust panel | Guiding — "look at these verified providers" |
| `physio-male-confident.png` | Male | Arms crossed, confident stance, looking at camera | ProviderCTA section (dark bg) | Authority — "join us as a provider" |
| `physio-female-treating.png` | Female | Seated on stool, guiding a patient's arm stretch (side view) | About page (future) | In-action physiotherapy |
| `physio-male-teaching.png` | Male | Pointing upward at a checklist, teaching pose | How It Works homepage (future use) | Educational — "here's how it works" |
| `physio-female-waving.png` | Female | Casual wave, slightly turned, friendly | 404/Error pages | Friendly — "let's get you back on track" |
| `physio-male-thumbsup.png` | Male | Thumbs up, celebratory expression | Booking confirmation page | Celebration — "you're all set!" |

## Current Fallback

Until the above assets are produced, code uses:
- `../physio-female.png` as stand-in for all female poses
- `../physio-male.png` as stand-in for all male poses

Each usage site stores its character path in a named constant (e.g. `PROOF_CHARACTER`, `PROVIDER_CHARACTER`) so swapping in new images is a one-line change per placement.
