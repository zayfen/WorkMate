import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'node:path'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow | null = null

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
  await createWindow()
})

ipcMain.handle('ping', () => 'pong')


