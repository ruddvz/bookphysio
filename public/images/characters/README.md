# Character Asset Inventory

3D physio character illustrations used throughout BookPhysio. All images should be transparent PNGs, minimum 850×1250px (2× for retina).

## Style Guidelines

- **Art style:** 3D clay/figurine rendering — soft matte finish, warm lighting
- **Clothing:** White lab coat over navy scrubs (both characters)
- **Skin tones:** Female is medium-brown, male is light. Maintain this diversity.
- **Expressions:** Warm and professional. Think "doctor you'd trust", not exaggerated smiles.
- **Background:** Transparent PNG, full-body or 3/4 body shots
- **Lighting:** Top-left key light, consistent across all poses
- **Shadows:** Soft drop shadow baked in for depth on any background

## Planned Assets (8 Unique Poses)

| # | Filename | Character | Pose & Body Language | Expression | Placement | Rationale |
|---|----------|-----------|---------------------|------------|-----------|-----------|
| 1 | `physio-female-welcoming.png` | Female | Right arm extended, open-palm welcome. Left hand at side. 3/4 angle, slight forward lean. | Warm smile, brows slightly raised | **Homepage Hero** — right side, desktop | First impression — "come in, we can help" |
| 2 | `physio-male-pointing.png` | Male | Left hand on hip, right hand pointing up (index finger). 3/4 angle, slight head tilt. | Engaged, knowledgeable half-smile | **Homepage Hero** — left side, desktop | Draws eye toward headline/search |
| 3 | `physio-female-clipboard.png` | Female | Holding clipboard at chest in left hand, right index finger on it. Facing viewer. | Focused but friendly, head tilt | **ProofSection** trust panel | Reviewing credentials — supports "trust" message |
| 4 | `physio-male-thumbsup.png` | Male | Left hand thumbs-up at shoulder height. Right in pocket. Slight lean back, 3/4 angle. | Confident grin, direct eye contact | **ProviderCTA** — floating above dashboard | Peer endorsement — "join us, it works" |
| 5 | `physio-female-presenting.png` | Female | Both hands mid-chest, palms up, presenting gesture. One foot forward. | Engaged, explaining expression | **How It Works — Patient tab hero** | Walking patients through the process |
| 6 | `physio-male-laptop.png` | Male | Laptop cradled in left arm, right hand on screen. Weight on one leg. | Focused, productive half-smile | **How It Works — Provider tab hero** | Digital workflow — the dashboard they'll use |
| 7 | `physio-male-arms-crossed.png` | Male | Arms crossed (confident). Feet shoulder-width. Facing viewer. | Assured half-smile | **How It Works — dark CTA section** | Authority for conversion push |
| 8 | `physio-female-waving.png` | Female | Right hand wave. Left arm relaxed. Slight step forward. | Big friendly smile | **404 / empty states / confirmation** | Friendly catch-all |

## Commissioning Brief

- Match exact 3D clay/figurine rendering style of existing `physio-female.png` and `physio-male.png`
- Same character models (face, skin tone, hair, clothing)
- Transparent PNG, minimum 850px wide
- Full-body for hero placements (#1, #2, #5, #6, #8)
- Waist-up acceptable for smaller placements (#3, #4, #7)
- Top-left lighting, soft baked-in drop shadow
- Consistent clothing: white lab coat over navy scrubs

## Current Fallback

Until the above assets are produced, code uses:
- `../physio-female.png` as stand-in for all female poses
- `../physio-male.png` as stand-in for all male poses

Each usage site stores its character path in a named constant (e.g. `PROOF_CHARACTER`, `PROVIDER_CHARACTER`) so swapping in new images is a one-line change per placement.

## Code References

| Constant | File | Current Fallback |
|----------|------|-----------------|
| `PATIENT_CHARACTER` | `src/app/how-it-works/page.tsx` | `physio-female.png` |
| `PROVIDER_CHARACTER` | `src/app/how-it-works/page.tsx` | `physio-male.png` |
| `PROOF_CHARACTER` | `src/components/ProofSection.tsx` | `physio-female.png` |
| Hero left character | `src/components/HeroSection.tsx` | `physio-male.png` |
| Hero right character | `src/components/HeroSection.tsx` | `physio-female.png` |
| ProviderCTA character | `src/components/ProviderCTA.tsx` | `physio-female.png` |
