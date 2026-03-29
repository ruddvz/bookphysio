// NOTE: Tailwind v4 uses CSS-first configuration via src/app/globals.css (@theme inline).
// This file defines design tokens for reference and for unit testing only.
// The actual tokens applied to the app are in globals.css @theme section.
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bp-primary': '#00766C',
        'bp-primary-dark': '#005A52',
        'bp-primary-light': '#E6F4F3',
        'bp-accent': '#FF6B35',
        'bp-surface': '#F5F5F5',
        'bp-text': '#1A1A1A',
        'bp-muted': '#6B7280',
      },
      borderRadius: {
        card: '8px',
        btn: '24px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        sm: '375px',
        md: '768px',
        lg: '1280px',
      },
    },
  },
}

export default config
