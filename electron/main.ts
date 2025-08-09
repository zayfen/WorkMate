import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import { join, dirname } from 'node:path'
import { mkdirSync } from 'node:fs'
import { DatabaseManager } from './models/db'
import { UsersDao } from './models/users'
import { SettingsDao } from './models/settings'
import { ProjectsDao } from './models/projects'
import { TasksDao, TaskPriority, TaskStatus, TaskListDue } from './models/tasks'

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
}) => {
  const tasksDao = new TasksDao()
  const id = tasksDao.create({
    project_id: Number(payload?.project_id),
    title: String(payload?.title || '').slice(0, 200) || '未命名任务',
    description: payload?.description ?? null,
    participants: Array.isArray(payload?.participants) ? payload?.participants?.slice(0, 50) : [],
    due_date: typeof payload?.due_date === 'number' ? payload?.due_date : null,
    priority: payload?.priority === 'low' || payload?.priority === 'medium' || payload?.priority === 'high' ? payload?.priority : 'medium',
    status: payload?.status === 'todo' || payload?.status === 'in_progress' || payload?.status === 'done' ? payload?.status : 'todo',
    note: payload?.note ?? null
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
}) => {
  const id = Number(payload?.id)
  if (!id) return false
  const tasksDao = new TasksDao()
  return tasksDao.update(id, {
    project_id: typeof payload?.project_id === 'number' ? payload?.project_id : undefined,
    title: typeof payload?.title === 'string' ? payload?.title : undefined,
    description: payload?.description,
    participants: Array.isArray(payload?.participants) ? payload?.participants : undefined,
    due_date: typeof payload?.due_date === 'number' ? payload?.due_date : payload?.due_date === null ? null : undefined,
    priority: payload?.priority,
    status: payload?.status,
    note: payload?.note
  })
})

ipcMain.handle('tasks:delete', async (_event, payload: { id: number }) => {
  const id = Number(payload?.id)
  if (!id) return false
  const tasksDao = new TasksDao()
  return tasksDao.delete(id)
})

