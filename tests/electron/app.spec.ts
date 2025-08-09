import { test, expect, _electron as electron } from '@playwright/test'

test('Electron app launches and loads page', async () => {
  const app = await electron.launch({ args: ['.'] })
  const window = await app.firstWindow()
  await window.waitForLoadState('domcontentloaded')
  await expect(window.locator('h1')).toHaveText('WorkMate')
  await app.close()
})


