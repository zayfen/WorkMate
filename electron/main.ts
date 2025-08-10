import { app, BrowserWindow, ipcMain, shell, dialog, Notification, nativeImage } from 'electron'
import { setupLanTaskCompleteNotifications, maybeBroadcastTaskComplete } from './services/lan/task-complete'
import { join, dirname } from 'node:path'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { DatabaseManager } from './models/db'
import { SettingsDao } from './models/settings'
import { UsersDao } from './models/users'
import { UdpLanService } from './services/lan/udp-service'
import { MessagesDao } from './models/messages'
import { ProjectsDao } from './models/projects'
import { TasksDao, TaskPriority, TaskStatus, TaskListDue } from './models/tasks'

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow | null = null
let lanService: UdpLanService | null = null

function shouldOpenDevTools(): boolean {
  try {
    if (process.env.VITE_DEV_SERVER_URL) return true
    if (String(process.env.ELECTRON_OPEN_DEVTOOLS || '') === '1') return true
    if (Array.isArray(process.argv) && process.argv.includes('--devtools')) return true
  } catch {}
  return false
}

function resolveWindowIconPath(): string | undefined {
  try {
    const projectRoot = process.cwd()
    if (process.platform === 'win32') {
      const winIcon = join(projectRoot, 'build', 'icon.ico')
      return existsSync(winIcon) ? winIcon : undefined
    }
    if (process.platform === 'linux') {
      const png512 = join(projectRoot, 'build', 'icons', '512x512.png')
      if (existsSync(png512)) return png512
      const png = join(projectRoot, 'build', 'icon.png')
      return existsSync(png) ? png : undefined
    }
  } catch {}
  return undefined
}

// Ensure single instance
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
}
app.on('second-instance', async () => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
    } else {
      await createWindow()
    }
  } catch {
    try { await createWindow() } catch {}
  }
})

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 700,
    icon: resolveWindowIconPath(),
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
    try {
      if (shouldOpenDevTools() && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.openDevTools({ mode: 'detach' })
      }
    } catch {}
  } else {
    await mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
    try {
      if (shouldOpenDevTools() && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.openDevTools({ mode: 'detach' })
      }
    } catch {}
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 窗口关闭时清理引用，避免后续访问已销毁对象
  mainWindow.on('closed', () => {
    try { mainWindow?.removeAllListeners() } catch {}
    mainWindow = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) await createWindow()
})

app.whenReady().then(async () => {
  // Set Dock icon on macOS during development if available
  if (process.platform === 'darwin') {
    try {
      const icns = join(process.cwd(), 'build', 'icon.icns')
      if ((app as any)?.dock && existsSync(icns)) {
        const img = nativeImage.createFromPath(icns)
        if (!img.isEmpty()) {
          app.dock!.setIcon(img)
        }
      }
    } catch {}
  }

  // Initialize database in userData directory
  const dbPath = join(app.getPath('userData'), 'data', 'workmate.sqlite')
  try { mkdirSync(dirname(dbPath), { recursive: true }) } catch {}
  DatabaseManager.initialize(dbPath)

  await createWindow()

  // Start LAN service after DB and window are ready
  const settings = new SettingsDao()
  const deviceId = settings.ensureDeviceId()
  const users = new UsersDao()
  const me = users.getUserByLocalId('local_user') || { name: '未命名用户' }
  lanService = new UdpLanService({ deviceId, name: me.name || '未命名用户' })
  await lanService.start()
  const messagesDao = new MessagesDao()
  // listen chat and persist (today only is guaranteed by DAO purge API if needed)
  lanService.onChat((msg) => {
    try {
      messagesDao.create({ from_device_id: msg.from, to_device_id: msg.to ?? null, text: msg.text, ts: msg.ts })
    } catch (e) {
      console.error('Failed to store incoming chat', e)
    }
    // Notify renderer about incoming chat for real-time update
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('lan:chat', {
          from_device_id: msg.from,
          to_device_id: msg.to ?? null,
          text: msg.text,
          ts: msg.ts
        })
      // If the message is directly sent to me, show a system notification
      try {
        const settings = new SettingsDao()
        const myId = settings.ensureDeviceId()
        if (msg.to && msg.to === myId) {
          const title = '新私聊消息'
          const body = msg.text.slice(0, 100)
          new Notification({ title, body }).show()
        }
      } catch {}
      }
      
    } catch (e) {
      console.error('lan:chat forward failed', e)
    }
  })
  // listen task-complete broadcast → system notification + sound (testable wrapper)
  setupLanTaskCompleteNotifications(
    lanService,
    (title, body) => new Notification({ title, body }).show(),
    () => { try { shell.beep() } catch {} }
  )
})

ipcMain.handle('ping', () => 'pong')
// Settings generic KV for sticky-note
ipcMain.handle('settings:get', async (_e, payload: { key: string }) => {
  try {
    const s = new SettingsDao()
    return s.get(String(payload?.key || ''))
  } catch {
    return null
  }
})
ipcMain.handle('settings:set', async (_e, payload: { key: string; value: string }) => {
  try {
    const s = new SettingsDao()
    s.set(String(payload?.key || ''), String(payload?.value ?? ''))
    return true
  } catch {
    return false
  }
})

// LAN presence handlers
ipcMain.handle('lan:list-online', async () => {
  try {
    if (!lanService) return []
    return lanService.getOnlinePeers().map((p) => ({
      deviceId: p.deviceId,
      name: p.name,
      lastSeen: p.lastSeen
    }))
  } catch (e) {
    console.error('lan:list-online error', e)
    return []
  }
})

ipcMain.handle('lan:send-chat', async (_event, payload: { to?: string; text: string }) => {
  try {
    const text = String(payload?.text || '').slice(0, 2000)
    if (!text) return false
    if (!lanService) return false
    lanService.sendChat(text, payload?.to)
    // store my outgoing as well
    const settings = new SettingsDao()
    const from = settings.ensureDeviceId()
    const messagesDao = new MessagesDao()
    const ts = Date.now()
    messagesDao.create({ from_device_id: from, to_device_id: payload?.to ?? null, text, ts })
    // notify renderer immediately for local echo
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('lan:chat', {
          from_device_id: from,
          to_device_id: payload?.to ?? null,
          text,
          ts
        })
      }
    } catch (e) {
      console.error('lan:chat local echo failed', e)
    }
    return true
  } catch (e) {
    console.error('lan:send-chat error', e)
    return false
  }
})

ipcMain.handle('lan:list-today-messages', async (_event, payload?: { withDeviceId?: string }) => {
  try {
    const messagesDao = new MessagesDao()
    // ensure only today messages are kept
    try { messagesDao.purgeNotToday() } catch {}
    if (payload?.withDeviceId) {
      const settings = new SettingsDao()
      const me = settings.ensureDeviceId()
      return messagesDao.listTodayWithPeer(me, payload.withDeviceId)
    }
    // broadcast view: only messages with to_device_id IS NULL
    return messagesDao.listBroadcastToday()
  } catch (e) {
    console.error('lan:list-today-messages error', e)
    return []
  }
})

ipcMain.handle('lan:list-conversations', async () => {
  try {
    if (!lanService) return []
    const settings = new SettingsDao()
    const me = settings.ensureDeviceId()
    const online = lanService.getOnlinePeers()
    const messagesDao = new MessagesDao()
    const list = online
      .filter(p => p.deviceId !== me)
      .map((p) => {
        const last = messagesDao.getLastWithPeer(me, p.deviceId)
        return {
          deviceId: p.deviceId,
          name: p.name,
          lastMessageText: last?.text ?? '',
          lastMessageTs: last?.ts ?? 0,
          lastSeen: p.lastSeen
        }
      })
    // sort: by lastMessageTs desc, fallback to lastSeen desc
    list.sort((a, b) => {
      const at = a.lastMessageTs || 0
      const bt = b.lastMessageTs || 0
      if (bt !== at) return bt - at
      return b.lastSeen - a.lastSeen
    })
    return list
  } catch (e) {
    console.error('lan:list-conversations error', e)
    return []
  }
})

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
  if (!mainWindow || mainWindow.isDestroyed()) return null
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

// Projects handlers
ipcMain.handle('projects:list', async (_event, payload: { includeArchived?: boolean }) => {
  const includeArchived = Boolean(payload?.includeArchived)
  const projectsDao = new ProjectsDao()
  const tasksDao = new TasksDao()
  const rows = projectsDao.list(includeArchived)
  const ids = rows.map((r) => r.id)
  const counts = tasksDao.countsForProjectIds(ids)
  const countsMap = new Map(counts.map((c) => [c.project_id, c]))
  return rows.map((r) => {
    const participants = r.participants ? safeParseJsonArray(r.participants) : []
    const c = countsMap.get(r.id) || { total: 0, done: 0, in_progress: 0, todo: 0 }
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      created_at: r.created_at,
      archived: r.archived === 1,
      estimated_end_at: r.estimated_end_at,
      participants,
      counts: c
    }
  })
})

ipcMain.handle('projects:create', async (_event, payload: { title: string; description?: string | null; estimated_end_at?: number | null; participants?: string[] }) => {
  const projectsDao = new ProjectsDao()
  const id = projectsDao.create({
    title: String(payload?.title || '').slice(0, 200) || '未命名项目',
    description: payload?.description ?? null,
    estimated_end_at: typeof payload?.estimated_end_at === 'number' ? payload.estimated_end_at : null,
    participants: Array.isArray(payload?.participants) ? payload?.participants?.slice(0, 50) : []
  })
  const row = projectsDao.getById(id)
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    created_at: row.created_at,
    archived: row.archived === 1,
    estimated_end_at: row.estimated_end_at,
    participants: row.participants ? safeParseJsonArray(row.participants) : [],
    counts: { total: 0, done: 0, in_progress: 0, todo: 0 }
  }
})

ipcMain.handle('projects:update', async (_event, payload: { id: number; title?: string; description?: string | null; estimated_end_at?: number | null; participants?: string[] }) => {
  const id = Number(payload?.id)
  if (!id) return false
  const projectsDao = new ProjectsDao()
  projectsDao.update(id, {
    title: payload?.title,
    description: payload?.description,
    estimated_end_at: payload?.estimated_end_at,
    participants: payload?.participants
  })
  return true
})

ipcMain.handle('projects:set-archived', async (_event, payload: { id: number; archived: boolean }) => {
  const id = Number(payload?.id)
  if (!id) return false
  const projectsDao = new ProjectsDao()
  projectsDao.setArchived(id, Boolean(payload?.archived))
  return true
})

ipcMain.handle('projects:delete', async (_event, payload: { id: number }) => {
  const id = Number(payload?.id)
  if (!id) return false
  const projectsDao = new ProjectsDao()
  projectsDao.delete(id)
  return true
})

function safeParseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

// Tasks handlers
ipcMain.handle('tasks:list', async (_event, payload: {
  statuses?: TaskStatus[]
  priorities?: TaskPriority[]
  projectIds?: number[]
  due?: TaskListDue
  includeDone?: boolean
}) => {
  const tasksDao = new TasksDao()
  const filters = {
    statuses: Array.isArray(payload?.statuses) ? payload?.statuses?.filter((s): s is TaskStatus => s === 'todo' || s === 'in_progress' || s === 'done') : undefined,
    priorities: Array.isArray(payload?.priorities) ? payload?.priorities?.filter((p): p is TaskPriority => p === 'low' || p === 'medium' || p === 'high') : undefined,
    projectIds: Array.isArray(payload?.projectIds) ? payload?.projectIds?.map((n) => Number(n)).filter((n) => Number.isFinite(n)) : undefined,
    due: payload?.due === 'today' || payload?.due === 'this_week' || payload?.due === 'this_month' || payload?.due === 'all' ? payload?.due : undefined,
    includeDone: Boolean(payload?.includeDone)
  }
  return tasksDao.list(filters)
})

ipcMain.handle('tasks:create', async (_event, payload: {
  project_id: number
  title: string
  description?: string | null
  participants?: string[]
  due_date?: number | null
  priority?: TaskPriority
  status?: TaskStatus
  note?: string | null
  progress?: number
  start_time?: number | null
}) => {
  const tasksDao = new TasksDao()
  const status: TaskStatus = payload?.status === 'todo' || payload?.status === 'in_progress' || payload?.status === 'done' ? payload?.status : 'todo'
  const progress = status === 'done' ? 100 : (typeof payload?.progress === 'number' ? payload?.progress : 0)
  const id = tasksDao.create({
    project_id: Number(payload?.project_id),
    title: String(payload?.title || '').slice(0, 200) || '未命名任务',
    description: payload?.description ?? null,
    participants: Array.isArray(payload?.participants) ? payload?.participants?.slice(0, 50) : [],
    due_date: typeof payload?.due_date === 'number' ? payload?.due_date : null,
    priority: payload?.priority === 'low' || payload?.priority === 'medium' || payload?.priority === 'high' ? payload?.priority : 'medium',
    status,
    note: payload?.note ?? null,
    progress,
    start_time: typeof payload?.start_time === 'number' ? payload?.start_time : undefined
  })
  return tasksDao.getById(id)
})

ipcMain.handle('tasks:update', async (_event, payload: {
  id: number
  project_id?: number
  title?: string
  description?: string | null
  participants?: string[]
  due_date?: number | null
  priority?: TaskPriority
  status?: TaskStatus
  note?: string | null
  progress?: number
  start_time?: number | null
}) => {
  const id = Number(payload?.id)
  if (!id) return false
  const tasksDao = new TasksDao()
  const before = tasksDao.getById(id)
  const fields: any = {
    project_id: typeof payload?.project_id === 'number' ? payload?.project_id : undefined,
    title: typeof payload?.title === 'string' ? payload?.title : undefined,
    description: payload?.description,
    participants: Array.isArray(payload?.participants) ? payload?.participants : undefined,
    due_date: typeof payload?.due_date === 'number' ? payload?.due_date : payload?.due_date === null ? null : undefined,
    priority: payload?.priority,
    status: payload?.status,
    note: payload?.note,
    progress: typeof payload?.progress === 'number' ? payload?.progress : undefined,
    start_time: typeof payload?.start_time === 'number' ? payload?.start_time : undefined
  }
  if (payload?.status === 'done') {
    fields.progress = 100
  }
  // prohibit jumping from todo -> done directly
  if (payload?.status === 'done') {
    const current = before
    if (current && current.status === 'todo') {
      return false
    }
  }
  // set start_time if moving to in_progress and not provided
  if (payload?.status === 'in_progress' && fields.start_time === undefined) {
    fields.start_time = Date.now()
  }
  const ok = tasksDao.update(id, fields)
  try {
    if (ok) {
      const after = tasksDao.getById(id)
      maybeBroadcastTaskComplete(lanService, before ? { id: before.id, title: before.title, status: before.status } : null, after ? { id: after.id, title: after.title, status: after.status } : null)
    }
  } catch (e) {
    console.error('tasks:update broadcast task-complete failed', e)
  }
  return ok
})

ipcMain.handle('tasks:delete', async (_event, payload: { id: number }) => {
  const id = Number(payload?.id)
  if (!id) return false
  const tasksDao = new TasksDao()
  return tasksDao.delete(id)
})

// Report export handlers
ipcMain.handle('report:save-text', async (_event, payload: { content: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return false
  const res = await dialog.showSaveDialog(mainWindow, {
    title: '保存报告',
    defaultPath: payload?.defaultPath ?? 'report.txt',
    filters: payload?.filters && payload.filters.length > 0 ? payload.filters : [
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  if (res.canceled || !res.filePath) return false
  try {
    writeFileSync(res.filePath, String(payload?.content ?? ''), 'utf8')
    return true
  } catch (e) {
    console.error('Failed to save text file', e)
    return false
  }
})

ipcMain.handle('report:save-pdf', async (_event, payload: { html: string; defaultPath?: string }) => {
  if (!mainWindow || mainWindow.isDestroyed()) return false
  const res = await dialog.showSaveDialog(mainWindow, {
    title: '导出 PDF',
    defaultPath: payload?.defaultPath ?? 'report.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  })
  if (res.canceled || !res.filePath) return false

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  })
  try {
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(String(payload?.html ?? ''))
    await win.loadURL(dataUrl)
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      margins: { marginType: 'default' },
      pageSize: 'A4',
      landscape: false
    })
    require('node:fs').writeFileSync(res.filePath, pdfBuffer)
    win.close()
    return true
  } catch (e) {
    console.error('Failed to export PDF', e)
    try { win.close() } catch {}
    return false
  }
})

