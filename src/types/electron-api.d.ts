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
          // Tasks
          listTasks?: (filters?: {
            statuses?: Array<'todo' | 'in_progress' | 'done'>
            priorities?: Array<'low' | 'medium' | 'high'>
            projectIds?: number[]
            due?: 'today' | 'this_week' | 'this_month' | 'all'
            includeDone?: boolean
          }) => Promise<Array<{
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
          }>>
          createTask?: (payload: {
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
          }) => Promise<{
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
          } | null>
          updateTask?: (payload: {
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
          }) => Promise<boolean>
          deleteTask?: (id: number) => Promise<boolean>
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
        // generic settings
        getSetting?: (key: string) => Promise<string | null>
        setSetting?: (key: string, value: string) => Promise<boolean>
      chooseAvatar?: () => Promise<string | null>
      // Reports export
      saveReportText?: (content: string, defaultPath?: string, filters?: Array<{ name: string; extensions: string[] }>) => Promise<boolean>
      saveReportPdf?: (html: string, defaultPath?: string) => Promise<boolean>
      // LAN presence & messaging
      lanListOnline?: () => Promise<Array<{ deviceId: string; name: string; lastSeen: number }>>
      lanSendChat?: (payload: { to?: string; text: string }) => Promise<boolean>
      lanListTodayMessages?: (withDeviceId?: string) => Promise<Array<{
        id: number
        from_device_id: string
        to_device_id: string | null
        text: string
        ts: number
        day_key: string
      }>>
      lanListConversations?: () => Promise<Array<{
        deviceId: string
        name: string
        lastMessageText: string
        lastMessageTs: number
        lastSeen: number
      }>>
    }
  }
}


