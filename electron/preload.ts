import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  ping: () => ipcRenderer.invoke('ping'),
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


