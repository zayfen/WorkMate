import path from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: [
      'src/**/*.{test,spec}.ts',
      'src/**/*.{test,spec}.tsx'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'tests/**',
      'e2e/**',
      'playwright/**'
    ]
  }
})


