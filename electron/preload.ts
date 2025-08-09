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
  chooseAvatar: () => ipcRenderer.invoke('user:choose-avatar') as Promise<string | null>
})


