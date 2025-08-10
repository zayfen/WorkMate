export type ReportGranularity = 'day' | 'week' | 'month' | 'half-year' | 'year'

export interface ReportQuery {
  granularity: ReportGranularity
  // Unix ms inclusive range
  from: number
  to: number
  title?: string
}

export interface RendererTask {
  id: number
  project_id: number
  title: string
  description: string | null
  participants: string[]
  due_date: number | null
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'done'
  note: string | null
  created_at: number
  updated_at: number | null
}

export interface ReportBucket {
  label: string
  start: number
  end: number
  tasks: RendererTask[]
  counts: {
    total: number
    done: number
    in_progress: number
    todo: number
  }
}

export interface ReportData {
  query: ReportQuery
  generatedAt: number
  summary: {
    total: number
    done: number
    in_progress: number
    todo: number
    completionRate: number
    priorities: {
      low: number
      medium: number
      high: number
    }
    overdue: number
  }
  buckets: ReportBucket[]
  sections: {
    highlights: RendererTask[]
    inProgress: RendererTask[]
    planned: RendererTask[]
    risks: RendererTask[]
    overdue: RendererTask[]
  }
}


