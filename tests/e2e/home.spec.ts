import { test, expect } from '@playwright/test'

test('home page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'WorkMate' })).toBeVisible()
  await expect(page.getByText('Vue 3 + TypeScript + Vite + Router + Electron + Vitest')).toBeVisible()
})


