import { defineConfig } from '@playwright/test'
import path from 'node:path'

export default defineConfig({
  testDir: './tests/electron',
  timeout: 60 * 1000,
  reporter: 'list',
  projects: [
    { name: 'electron' }
  ],
  workers: 1
})


