import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    name: 'performance',
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['**/*.performance.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out'],
    globals: true,
    testTimeout: 30000, // Longer timeout for performance tests
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})