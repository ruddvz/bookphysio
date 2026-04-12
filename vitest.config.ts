import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    env: {
      // Provide a deterministic secret so demo-cookie tests can call encodeDemoCookie
      // (deterministic test value; exact length is not important)
      DEMO_COOKIE_SECRET: 'test-demo-cookie-secret-32-bytes-ok',
    },
    exclude: [
      '**/node_modules/**',
      '**/e2e/**',
      '**/.worktrees/**',
      '**/*.spec.ts',
      '**/static-pages.test.tsx',
      '**/design-tokens.test.ts',
      '**/AdminDashboard.test.tsx',
      '**/SpecialtyPage.test.tsx',
      '**/CityPage.test.tsx',
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
