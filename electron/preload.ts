import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
  // Projects
  listProjects: (includeArchived = false) =>
    ipcRenderer.invoke('projects:list', { includeArchived }) as Promise<Array<{
      id: number
      title: string
      description: string | null
      created_at: number
      archived: boolean
      estimated_end_at: number | null
      participants: string[]
      counts: { total: number; done: number; in_progress: number; todo: number }
    }>>,
  createProject: (payload: { title: string; description?: string | null; estimated_end_at?: number | null; participants?: string[] }) =>
    ipcRenderer.invoke('projects:create', payload) as Promise<{
      id: number
      title: string
      description: string | null
      created_at: number
      archived: boolean
      estimated_end_at: number | null
      participants: string[]
      counts: { total: number; done: number; in_progress: number; todo: number }
    } | null>,
  updateProject: (payload: { id: number; title?: string; description?: string | null; estimated_end_at?: number | null; participants?: string[] }) =>
    ipcRenderer.invoke('projects:update', payload) as Promise<boolean>,
  setProjectArchived: (id: number, archived: boolean) =>
    ipcRenderer.invoke('projects:set-archived', { id, archived }) as Promise<boolean>,
  deleteProject: (id: number) =>
    ipcRenderer.invoke('projects:delete', { id }) as Promise<boolean>,
  // Tasks
  listTasks: (filters?: {
    statuses?: Array<'todo' | 'in_progress' | 'done'>
    priorities?: Array<'low' | 'medium' | 'high'>
    projectIds?: number[]
    due?: 'today' | 'this_week' | 'this_month' | 'all'
    includeDone?: boolean
  }) => ipcRenderer.invoke('tasks:list', filters ?? {}) as Promise<Array<{
    id: number
    project_id: number
    title: string
    description: string | null
    participants: string[]
    due_date: number | null
    priority: 'low' | 'medium' | 'high'
    status: 'todo' | 'in_progress' | 'done'
    note: string | null
    progress: number
    created_at: number
    updated_at: number | null
  }>>,
  createTask: (payload: {
    project_id: number
    title: string
    description?: string | null
    participants?: string[]
    due_date?: number | null
    priority?: 'low' | 'medium' | 'high'
    status?: 'todo' | 'in_progress' | 'done'
    note?: string | null
    progress?: number
    start_time?: number | null
  }) => ipcRenderer.invoke('tasks:create', payload) as Promise<{
    id: number
    project_id: number
    title: string
    description: string | null
    participants: string[]
    due_date: number | null
    priority: 'low' | 'medium' | 'high'
    status: 'todo' | 'in_progress' | 'done'
    note: string | null
    progress: number
    start_time: number | null
    created_at: number
    updated_at: number | null
  } | null>,
  updateTask: (payload: {
    id: number
    project_id?: number
    title?: string
    description?: string | null
    participants?: string[]
    due_date?: number | null
    priority?: 'low' | 'medium' | 'high'
    status?: 'todo' | 'in_progress' | 'done'
    note?: string | null
    progress?: number
    start_time?: number | null
  }) => ipcRenderer.invoke('tasks:update', payload) as Promise<boolean>,
  deleteTask: (id: number) => ipcRenderer.invoke('tasks:delete', { id }) as Promise<boolean>,
  getUserProfile: () => ipcRenderer.invoke('user:get-profile') as Promise<{
    id: number
    name: string
    avatar_path: string | null
    avatar_base64: string | null
    note: string | null
    local_id: string
    last_seen: number
    device_info: string | null
  } | null>,
  saveUserProfile: (payload: { name?: string; note?: string; avatar_base64?: string | null }) =>
    ipcRenderer.invoke('user:save-profile', payload) as Promise<{
      id: number
      name: string
      avatar_path: string | null
      avatar_base64: string | null
      note: string | null
      local_id: string
      last_seen: number
      device_info: string | null
    } | null>,
  getDeviceId: () => ipcRenderer.invoke('settings:get-device-id') as Promise<string>,
  chooseAvatar: () => ipcRenderer.invoke('user:choose-avatar') as Promise<string | null>,
  // Reports export
  saveReportText: (content: string, defaultPath?: string, filters?: Array<{ name: string; extensions: string[] }>) =>
    ipcRenderer.invoke('report:save-text', { content, defaultPath, filters }) as Promise<boolean>,
  saveReportPdf: (html: string, defaultPath?: string) =>
    ipcRenderer.invoke('report:save-pdf', { html, defaultPath }) as Promise<boolean>,
  // LAN presence & messaging
  lanListOnline: () => ipcRenderer.invoke('lan:list-online') as Promise<Array<{ deviceId: string; name: string; lastSeen: number }>>,
  lanSendChat: (payload: { to?: string; text: string }) => ipcRenderer.invoke('lan:send-chat', payload) as Promise<boolean>,
  lanListTodayMessages: (withDeviceId?: string) =>
    ipcRenderer.invoke('lan:list-today-messages', withDeviceId ? { withDeviceId } : {}) as Promise<Array<{
      id: number
      from_device_id: string
      to_device_id: string | null
      text: string
      ts: number
      day_key: string
    }>>
})


