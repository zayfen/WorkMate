import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join, dirname } from 'node:path'
import { mkdirSync } from 'node:fs'
import { DatabaseManager } from './models/db'
import { UsersDao } from './models/users'
import { SettingsDao } from './models/settings'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow | null = null

// Ensure single instance
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
    mainWindow.show()
  }
})

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  const pageUrl = process.env.VITE_DEV_SERVER_URL
  if (pageUrl) {
    await mainWindow.loadURL(pageUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    await mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) await createWindow()
})

app.whenReady().then(async () => {
  // Initialize database in userData directory
  const dbPath = join(app.getPath('userData'), 'data', 'workmate.sqlite')
  try { mkdirSync(dirname(dbPath), { recursive: true }) } catch {}
  DatabaseManager.initialize(dbPath)

  await createWindow()
})

ipcMain.handle('ping', () => 'pong')

// User profile handlers
ipcMain.handle('user:get-profile', async () => {
  try {
    const users = new UsersDao()
    const settings = new SettingsDao()
    const localId = 'local_user'

    let user = users.getUserByLocalId(localId)
    if (!user) {
      console.log('Creating new user...')
      users.createUser({ name: '未命名用户', local_id: localId, avatar_path: null, avatar_base64: null, note: null, device_info: null })
      user = users.getUserByLocalId(localId)
    }
    // Ensure device_id exists
    settings.ensureDeviceId()
    if (!user) {
      console.error('Failed to create/get user')
      return null
    }
    console.log('Got user profile:', user)
    return {
      ...user,
      avatar_path: null
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
})

ipcMain.handle('user:save-profile', async (_event, payload: { name?: string; note?: string; avatar_base64?: string | null }) => {
  try {
    console.log('Saving user profile:', payload)
    const users = new UsersDao()
    const localId = 'local_user'
    const clean = {
      name: typeof payload?.name === 'string' ? payload.name.slice(0, 100) : undefined,
      note: typeof payload?.note === 'string' ? payload.note.slice(0, 1000) : undefined,
      avatar_base64: payload?.avatar_base64 === null || typeof payload?.avatar_base64 === 'string' ? payload.avatar_base64 : undefined
    }
    users.updateUserByLocalId(localId, clean)
    const updated = users.getUserByLocalId(localId)
    console.log('Updated user profile:', updated)
    return updated ? { ...updated, avatar_path: null } : null
  } catch (error) {
    console.error('Error saving user profile:', error)
    return null
  }
})

ipcMain.handle('settings:get-device-id', async () => {
  const settings = new SettingsDao()
  return settings.ensureDeviceId()
})

ipcMain.handle('user:choose-avatar', async () => {
  if (!mainWindow) return null
  const res = await dialog.showOpenDialog(mainWindow, {
    title: '选择头像',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] }]
  })
  if (res.canceled || !res.filePaths[0]) return null

  const src = res.filePaths[0]
  try {
    // read file as base64
    const data = require('node:fs').readFileSync(src)
    const base64 = `data:image/${src.split('.').pop()};base64,${data.toString('base64')}`
    return base64
  } catch {
    return null
  }
})


