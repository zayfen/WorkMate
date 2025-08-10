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
      chooseAvatar?: () => Promise<string | null>
      // Reports export
      saveReportText?: (content: string, defaultPath?: string, filters?: Array<{ name: string; extensions: string[] }>) => Promise<boolean>
      saveReportPdf?: (html: string, defaultPath?: string) => Promise<boolean>
    }
  }
}


