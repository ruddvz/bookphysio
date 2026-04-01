import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
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
      '**/messages.test.ts',
    ],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
