export {};

declare global {
  interface Window {
    api?: {
      ping: () => Promise<string>
        // Projects
        listProjects?: (includeArchived?: boolean) => Promise<Array<{
          id: number
          title: string
          description: string | null
          created_at: number
          archived: boolean
          estimated_end_at: number | null
          participants: string[]
          counts: { total: number; done: number; in_progress: number; todo: number }
        }>>
        createProject?: (payload: { title: string; description?: string | null; estimated_end_at?: number | null; participants?: string[] }) => Promise<{
          id: number
          title: string
          description: string | null
          created_at: number
          archived: boolean
          estimated_end_at: number | null
          participants: string[]
          counts: { total: number; done: number; in_progress: number; todo: number }
        } | null>
        updateProject?: (payload: { id: number; title?: string; description?: string | null; estimated_end_at?: number | null; participants?: string[] }) => Promise<boolean>
        setProjectArchived?: (id: number, archived: boolean) => Promise<boolean>
        deleteProject?: (id: number) => Promise<boolean>
      getAppVersion?: () => Promise<string>
      getUserProfile?: () => Promise<{
        id: number
        name: string
        avatar_path: string | null
        avatar_base64: string | null
        note: string | null
        local_id: string
        last_seen: number
        device_info: string | null
      } | null>
      saveUserProfile?: (payload: { name?: string; note?: string; avatar_base64?: string | null }) => Promise<{
        id: number
        name: string
        avatar_path: string | null
        avatar_base64: string | null
        note: string | null
        local_id: string
        last_seen: number
        device_info: string | null
      } | null>
      getDeviceId?: () => Promise<string>
      chooseAvatar?: () => Promise<string | null>
    }
  }
}


