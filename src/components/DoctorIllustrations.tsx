// Claymorphism-style physiotherapy doctor illustrations
// Female (left) + Male (right) — same character style, physio lab coat attire

export function FemaleDoctorIllustration() {
  return (
    <svg
      viewBox="0 0 220 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="clay-f-body" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#6B5FA0" floodOpacity="0.18" />
        </filter>
        <filter id="clay-f-face" x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#6B5FA0" floodOpacity="0.15" />
        </filter>
        <filter id="clay-f-hair" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="2" dy="8" stdDeviation="8" floodColor="#0A0A18" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* ─── HAIR BACK LAYER ─── */}
      {/* Long flowing hair — wide blob behind head, extends full height */}
      <path
        d="M62 165 C42 210 38 295 42 420 L178 420 C182 295 178 210 158 165 C148 130 135 102 110 98 C85 102 72 130 62 165Z"
        fill="#18182A"
        filter="url(#clay-f-hair)"
      />

      {/* ─── LAB COAT ─── */}
      {/* Main coat body */}
      <path
        d="M36 238 C32 325 35 420 110 420 C185 420 188 325 184 238 C176 222 156 215 132 213 C112 211 88 211 68 213 C44 215 40 222 36 238Z"
        fill="#F3F3F6"
        filter="url(#clay-f-body)"
      />

      {/* Left sleeve */}
      <path
        d="M68 222 C40 250 32 305 35 358 C48 374 64 362 70 340 C76 305 76 262 77 232Z"
        fill="#F3F3F6"
      />
      {/* Left sleeve inner shadow */}
      <path
        d="M68 224 C62 248 60 278 62 308"
        stroke="#E2E2EC"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right sleeve */}
      <path
        d="M152 222 C180 250 188 305 185 358 C172 374 156 362 150 340 C144 305 144 262 143 232Z"
        fill="#F3F3F6"
      />
      {/* Right sleeve inner shadow */}
      <path
        d="M152 224 C158 248 160 278 158 308"
        stroke="#E2E2EC"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* ─── TEAL SCRUBS AT COLLAR ─── */}
      <path
        d="M90 218 C94 228 104 234 110 235 C116 234 126 228 130 218 C124 208 116 203 110 202 C104 203 96 208 90 218Z"
        fill="#00766C"
      />

      {/* Coat lapel lines */}
      <path
        d="M90 218 C82 234 79 260 79 284"
        stroke="#E0E0EA"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M130 218 C138 234 141 260 141 284"
        stroke="#E0E0EA"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ─── NECK ─── */}
      <rect x="96" y="178" width="28" height="42" rx="13" fill="#F5C8A8" />

      {/* ─── FACE ─── */}
      <ellipse
        cx="110"
        cy="136"
        rx="54"
        ry="57"
        fill="#F5C8A8"
        filter="url(#clay-f-face)"
      />

      {/* ─── HAIR FRONT ─── */}
      {/* Top crown */}
      <path
        d="M57 130 C60 68 84 48 110 46 C136 48 160 68 163 130 C152 88 132 72 110 71 C88 72 68 88 57 130Z"
        fill="#18182A"
      />
      {/* Left side strand */}
      <path
        d="M56 133 C47 164 46 214 50 268 C60 284 72 276 74 260 C72 210 70 166 67 136Z"
        fill="#18182A"
      />
      {/* Right side strand */}
      <path
        d="M164 133 C173 164 174 214 170 268 C160 284 148 276 146 260 C148 210 150 166 153 136Z"
        fill="#18182A"
      />

      {/* ─── FACE FEATURES ─── */}

      {/* Left eyebrow */}
      <path
        d="M77 106 C85 99 96 101 100 104"
        stroke="#2D1508"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right eyebrow */}
      <path
        d="M120 104 C124 101 135 99 143 106"
        stroke="#2D1508"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left eye — white, iris, pupil, shine */}
      <ellipse cx="90" cy="120" rx="10.5" ry="11.5" fill="white" />
      <ellipse cx="90" cy="121" rx="7.5" ry="8.5" fill="#3A2410" />
      <ellipse cx="90" cy="121" rx="4" ry="4.5" fill="#0F0600" />
      <ellipse cx="93.5" cy="117" rx="2.5" ry="2.5" fill="white" />

      {/* Right eye */}
      <ellipse cx="130" cy="120" rx="10.5" ry="11.5" fill="white" />
      <ellipse cx="130" cy="121" rx="7.5" ry="8.5" fill="#3A2410" />
      <ellipse cx="130" cy="121" rx="4" ry="4.5" fill="#0F0600" />
      <ellipse cx="133.5" cy="117" rx="2.5" ry="2.5" fill="white" />

      {/* Upper eyelid crease */}
      <path d="M80 115 C85 109 95 109 100 115" stroke="#D0906A" strokeWidth="1.2" fill="none" />
      <path d="M120 115 C125 109 135 109 140 115" stroke="#D0906A" strokeWidth="1.2" fill="none" />

      {/* Nose */}
      <ellipse cx="110" cy="141" rx="5" ry="3.5" fill="#E8A882" opacity="0.45" />
      <path d="M104 145 C107 148 113 148 116 145" stroke="#C47A5A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* Smile */}
      <path d="M94 156 C102 165 118 165 126 156" stroke="#C47A5A" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Left cheek blush */}
      <ellipse cx="72" cy="138" rx="17" ry="11" fill="#FF9999" opacity="0.22" />
      {/* Right cheek blush */}
      <ellipse cx="148" cy="138" rx="17" ry="11" fill="#FF9999" opacity="0.22" />

      {/* ─── STETHOSCOPE ─── */}
      {/* Hanging tubing */}
      <path
        d="M100 215 C89 234 84 252 83 272 C82 288 91 297 101 297 C111 297 120 288 119 272 C118 252 113 234 120 215"
        stroke="#9A9AB0"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Chest piece */}
      <ellipse cx="101" cy="298" rx="10" ry="6.5" fill="#BEBECE" />
      <ellipse cx="101" cy="297" rx="7" ry="4.5" fill="#9A9AB0" />
      <ellipse cx="101" cy="296.5" rx="4" ry="2.5" fill="#7A7A90" />

      {/* ─── COAT DETAILS ─── */}
      {/* Breast pocket */}
      <rect x="62" y="268" width="28" height="22" rx="5" fill="none" stroke="#D4D4E0" strokeWidth="1.5" />
      {/* Pen in pocket */}
      <rect x="72" y="268" width="5" height="18" rx="2.5" fill="#6B7BF5" />
      <ellipse cx="74.5" cy="267.5" rx="3" ry="2" fill="#9090A8" />

      {/* Name badge clip */}
      <rect x="115" y="268" width="30" height="20" rx="4" fill="white" stroke="#D4D4E0" strokeWidth="1.2" />
      <rect x="118" y="272" width="14" height="2" rx="1" fill="#C4C4D4" />
      <rect x="118" y="277" width="10" height="2" rx="1" fill="#C4C4D4" />
      <rect x="118" y="282" width="12" height="2" rx="1" fill="#00766C" opacity="0.5" />

      {/* Coat buttons */}
      <circle cx="110" cy="305" r="3.5" fill="#E4E4F0" />
      <circle cx="110" cy="330" r="3.5" fill="#E4E4F0" />
      <circle cx="110" cy="355" r="3.5" fill="#E4E4F0" />

      {/* Wrist peek — teal scrub cuff */}
      <path d="M35 352 C36 365 42 374 52 374 C62 372 68 362 70 348" stroke="#00766C" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M185 352 C184 365 178 374 168 374 C158 372 152 362 150 348" stroke="#00766C" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function MaleDoctorIllustration() {
  return (
    <svg
      viewBox="0 0 220 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="clay-m-body" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#6B5FA0" floodOpacity="0.18" />
        </filter>
        <filter id="clay-m-face" x="-25%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#6B5FA0" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* ─── SHORT HAIR (back, top of head) ─── */}
      <path
        d="M65 135 C60 108 64 72 74 58 C85 42 98 36 110 36 C122 36 135 42 146 58 C156 72 160 108 155 135 C148 106 132 91 110 90 C88 91 72 106 65 135Z"
        fill="#18182A"
      />
      {/* Hair texture on sides — subtle short crop */}
      <path d="M64 136 C58 150 57 168 62 178" stroke="#18182A" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M156 136 C162 150 163 168 158 178" stroke="#18182A" strokeWidth="7" strokeLinecap="round" fill="none" />

      {/* ─── LAB COAT ─── */}
      <path
        d="M36 240 C32 327 35 420 110 420 C185 420 188 327 184 240 C176 224 156 217 132 215 C112 213 88 213 68 215 C44 217 40 224 36 240Z"
        fill="#F3F3F6"
        filter="url(#clay-m-body)"
      />

      {/* Left sleeve */}
      <path
        d="M68 224 C40 252 32 307 35 360 C48 376 64 364 70 342 C76 307 76 264 77 234Z"
        fill="#F3F3F6"
      />
      <path
        d="M68 226 C62 250 60 280 62 310"
        stroke="#E2E2EC"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right sleeve */}
      <path
        d="M152 224 C180 252 188 307 185 360 C172 376 156 364 150 342 C144 307 144 264 143 234Z"
        fill="#F3F3F6"
      />
      <path
        d="M152 226 C158 250 160 280 158 310"
        stroke="#E2E2EC"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* ─── TEAL SCRUBS ─── */}
      <path
        d="M90 220 C94 230 104 236 110 237 C116 236 126 230 130 220 C124 210 116 205 110 204 C104 205 96 210 90 220Z"
        fill="#00766C"
      />

      {/* Coat lapels */}
      <path d="M90 220 C82 236 79 262 79 286" stroke="#E0E0EA" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M130 220 C138 236 141 262 141 286" stroke="#E0E0EA" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* ─── NECK ─── */}
      <rect x="96" y="180" width="28" height="42" rx="12" fill="#F0B090" />

      {/* ─── FACE ─── */}
      <ellipse
        cx="110"
        cy="138"
        rx="54"
        ry="57"
        fill="#F0B090"
        filter="url(#clay-m-face)"
      />

      {/* ─── BEARD ─── */}
      {/* Chin/jaw beard coverage */}
      <path
        d="M68 152 C68 175 78 194 110 200 C142 194 152 175 152 152 C143 164 128 172 110 173 C92 172 77 164 68 152Z"
        fill="#242230"
        opacity="0.92"
      />
      {/* Mustache */}
      <path
        d="M93 153 C99 157 105 158 110 157 C115 158 121 157 127 153"
        stroke="#242230"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Slight beard stubble texture on cheeks */}
      <ellipse cx="76" cy="148" rx="10" ry="6" fill="#242230" opacity="0.18" />
      <ellipse cx="144" cy="148" rx="10" ry="6" fill="#242230" opacity="0.18" />

      {/* ─── HAIR TOP (front) ─── */}
      <path
        d="M58 132 C62 70 86 48 110 47 C134 48 158 70 162 132 C152 92 134 76 110 75 C86 76 68 92 58 132Z"
        fill="#18182A"
      />

      {/* ─── FACE FEATURES ─── */}

      {/* Left eyebrow — thicker/straighter for male */}
      <path
        d="M74 104 C83 96 97 99 103 103"
        stroke="#1A0A04"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right eyebrow */}
      <path
        d="M117 103 C123 99 137 96 146 104"
        stroke="#1A0A04"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left eye */}
      <ellipse cx="90" cy="120" rx="10.5" ry="11.5" fill="white" />
      <ellipse cx="90" cy="121" rx="7.5" ry="8.5" fill="#3A2410" />
      <ellipse cx="90" cy="121" rx="4" ry="4.5" fill="#0F0600" />
      <ellipse cx="93.5" cy="117" rx="2.5" ry="2.5" fill="white" />

      {/* Right eye */}
      <ellipse cx="130" cy="120" rx="10.5" ry="11.5" fill="white" />
      <ellipse cx="130" cy="121" rx="7.5" ry="8.5" fill="#3A2410" />
      <ellipse cx="130" cy="121" rx="4" ry="4.5" fill="#0F0600" />
      <ellipse cx="133.5" cy="117" rx="2.5" ry="2.5" fill="white" />

      {/* Nose — slightly broader for male */}
      <ellipse cx="110" cy="141" rx="6" ry="4" fill="#D4946A" opacity="0.4" />
      <path d="M102 146 C106 150 114 150 118 146" stroke="#B46840" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Smile — visible above mustache */}
      <path d="M96 151 C103 156 117 156 124 151" stroke="#C47A5A" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Cheek blush — subtle for male */}
      <ellipse cx="68" cy="132" rx="14" ry="9" fill="#FF9999" opacity="0.14" />
      <ellipse cx="152" cy="132" rx="14" ry="9" fill="#FF9999" opacity="0.14" />

      {/* ─── STETHOSCOPE ─── */}
      <path
        d="M100 217 C89 236 84 254 83 274 C82 290 91 299 101 299 C111 299 120 290 119 274 C118 254 113 236 120 217"
        stroke="#9A9AB0"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="101" cy="300" rx="10" ry="6.5" fill="#BEBECE" />
      <ellipse cx="101" cy="299" rx="7" ry="4.5" fill="#9A9AB0" />
      <ellipse cx="101" cy="298.5" rx="4" ry="2.5" fill="#7A7A90" />

      {/* ─── COAT DETAILS ─── */}
      <rect x="62" y="270" width="28" height="22" rx="5" fill="none" stroke="#D4D4E0" strokeWidth="1.5" />
      <rect x="72" y="270" width="5" height="18" rx="2.5" fill="#6B7BF5" />
      <ellipse cx="74.5" cy="269.5" rx="3" ry="2" fill="#9090A8" />

      {/* Name badge */}
      <rect x="115" y="270" width="30" height="20" rx="4" fill="white" stroke="#D4D4E0" strokeWidth="1.2" />
      <rect x="118" y="274" width="14" height="2" rx="1" fill="#C4C4D4" />
      <rect x="118" y="279" width="10" height="2" rx="1" fill="#C4C4D4" />
      <rect x="118" y="284" width="12" height="2" rx="1" fill="#00766C" opacity="0.5" />

      {/* Coat buttons */}
      <circle cx="110" cy="307" r="3.5" fill="#E4E4F0" />
      <circle cx="110" cy="332" r="3.5" fill="#E4E4F0" />
      <circle cx="110" cy="357" r="3.5" fill="#E4E4F0" />

      {/* Wrist peek — teal scrub cuffs */}
      <path d="M35 354 C36 367 42 376 52 376 C62 374 68 364 70 350" stroke="#00766C" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M185 354 C184 367 178 376 168 376 C158 374 152 364 150 350" stroke="#00766C" strokeWidth="6" strokeLinecap="round" fill="none" />
    </svg>
  )
}
