import { DatabaseManager } from './db'

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskRecord {
  id?: number
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
  created_at?: number
  updated_at?: number | null
}

export interface TaskRow {
  id: number
  project_id: number
  title: string
  description: string | null
  participants: string[]
  due_date: number | null
  priority: TaskPriority
  status: TaskStatus
  note: string | null
  progress: number
  start_time: number | null
  created_at: number
  updated_at: number | null
}

export type TaskListDue = 'today' | 'this_week' | 'this_month' | 'all'

export interface TaskListFilters {
  statuses?: TaskStatus[]
  priorities?: TaskPriority[]
  projectIds?: number[]
  due?: TaskListDue
  includeDone?: boolean
}

export class TasksDao {
  countsForProjectIds(projectIds: number[]): Array<{
    project_id: number
    total: number
    done: number
    in_progress: number
    todo: number
  }> {
    if (projectIds.length === 0) return []
    const db = DatabaseManager.getDatabase()
    const placeholders = projectIds.map(() => '?').join(',')
    const sql = `
      SELECT 
        project_id,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo
      FROM tasks
      WHERE project_id IN (${placeholders})
      GROUP BY project_id
    `
    return db.prepare(sql).all(...projectIds) as Array<{ project_id: number; total: number; done: number; in_progress: number; todo: number }>
  }

  create(task: Omit<TaskRecord, 'id' | 'created_at' | 'updated_at'>): number {
    const db = DatabaseManager.getDatabase()
    const stmt = db.prepare(`
      INSERT INTO tasks (project_id, title, description, participants, due_date, priority, status, note, progress, start_time)
      VALUES (@project_id, @title, @description, @participants, @due_date, @priority, @status, @note, @progress, @start_time)
    `)
    const status: TaskStatus = task.status ?? 'todo'
    const progress = status === 'done' ? 100 : clampProgress(task.progress)
    const startTime = status === 'in_progress' ? (typeof task.start_time === 'number' ? task.start_time : Date.now()) : null
    const info = stmt.run({
      project_id: task.project_id,
      title: (task.title || '未命名任务').slice(0, 200),
      description: task.description ?? null,
      participants: JSON.stringify(task.participants ?? []),
      due_date: typeof task.due_date === 'number' ? task.due_date : null,
      priority: task.priority ?? 'medium',
      status,
      note: task.note ?? null,
      progress,
      start_time: startTime
    })
    return Number(info.lastInsertRowid)
  }

  getById(id: number): TaskRow | null {
    const db = DatabaseManager.getDatabase()
    const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(id) as (Omit<TaskRow, 'participants'> & { participants: string | null }) | undefined
    if (!row) return null
    const participants = row.participants ? this.safeParseJsonArray(row.participants) : []
    return { ...row, participants }
  }

  update(id: number, fields: Partial<Omit<TaskRecord, 'id' | 'created_at'>>): boolean {
    const db = DatabaseManager.getDatabase()
    const updates: string[] = []
    const params: Record<string, unknown> = { id }

    if (fields.project_id !== undefined) { updates.push('project_id = @project_id'); params.project_id = fields.project_id }
    if (fields.title !== undefined) { updates.push('title = @title'); params.title = (fields.title || '未命名任务').slice(0, 200) }
    if (fields.description !== undefined) { updates.push('description = @description'); params.description = fields.description ?? null }
    if (fields.participants !== undefined) { updates.push('participants = @participants'); params.participants = JSON.stringify(fields.participants ?? []) }
    if (fields.due_date !== undefined) { updates.push('due_date = @due_date'); params.due_date = typeof fields.due_date === 'number' ? fields.due_date : null }
    if (fields.priority !== undefined) { updates.push('priority = @priority'); params.priority = fields.priority ?? 'medium' }
    if (fields.status !== undefined) {
      updates.push('status = @status')
      const st: TaskStatus = fields.status ?? 'todo'
      params.status = st
      if (st === 'done') {
        // force progress to 100 when done
        if (!updates.includes('progress = @progress')) updates.push('progress = @progress')
        params.progress = 100
      } else if (st === 'in_progress') {
        // set start_time when moved to in_progress and not set yet
        if (!updates.includes('start_time = @start_time')) updates.push('start_time = @start_time')
        params.start_time = typeof (fields as any).start_time === 'number' ? (fields as any).start_time : Date.now()
      }
    }
    if (fields.note !== undefined) { updates.push('note = @note'); params.note = fields.note ?? null }
    if (fields.progress !== undefined && params.progress === undefined) { updates.push('progress = @progress'); params.progress = clampProgress(fields.progress) }
    updates.push(`updated_at = strftime('%s','now')*1000`)

    if (updates.length === 0) return false
    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = @id`
    const info = db.prepare(sql).run(params)
    return info.changes > 0
  }

  delete(id: number): boolean {
    const db = DatabaseManager.getDatabase()
    const info = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id)
    return info.changes > 0
  }

  list(filters: TaskListFilters = {}): TaskRow[] {
    const db = DatabaseManager.getDatabase()
    const where: string[] = []
    const params: Record<string, unknown> = {}

    // exclude archived projects
    // we will join with projects table and filter archived = 0

    if (Array.isArray(filters.projectIds) && filters.projectIds.length > 0) {
      const placeholders = filters.projectIds.map((_, i) => `@pid${i}`).join(',')
      where.push(`t.project_id IN (${placeholders})`)
      filters.projectIds.forEach((id, i) => { params[`pid${i}`] = id })
    }

    if (Array.isArray(filters.priorities) && filters.priorities.length > 0) {
      const placeholders = filters.priorities.map((_, i) => `@prio${i}`).join(',')
      where.push(`t.priority IN (${placeholders})`)
      filters.priorities.forEach((p, i) => { params[`prio${i}`] = p })
    }

    if (Array.isArray(filters.statuses) && filters.statuses.length > 0) {
      const placeholders = filters.statuses.map((_, i) => `@st${i}`).join(',')
      where.push(`t.status IN (${placeholders})`)
      filters.statuses.forEach((s, i) => { params[`st${i}`] = s })
    } else if (!filters.includeDone) {
      where.push(`t.status != 'done'`)
    }

    const now = Date.now()
    const startOfDay = new Date(new Date(now).toDateString()).getTime()
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1
    // compute week and month ranges
    const day = new Date(startOfDay)
    const dow = day.getDay() || 7 // Monday-start assumption? We'll use ISO week starting Monday.
    const monday = startOfDay - (dow - 1) * 24 * 60 * 60 * 1000
    const sunday = monday + 7 * 24 * 60 * 60 * 1000 - 1
    const firstOfMonth = new Date(day.getFullYear(), day.getMonth(), 1).getTime()
    const lastOfMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0).setHours(23, 59, 59, 999)

    if (filters.due === 'today') {
      where.push(`t.due_date BETWEEN @dueStart AND @dueEnd`)
      params.dueStart = startOfDay
      params.dueEnd = endOfDay
    } else if (filters.due === 'this_week') {
      where.push(`t.due_date BETWEEN @dueStart AND @dueEnd`)
      params.dueStart = monday
      params.dueEnd = sunday
    } else if (filters.due === 'this_month') {
      where.push(`t.due_date BETWEEN @dueStart AND @dueEnd`)
      params.dueStart = firstOfMonth
      params.dueEnd = lastOfMonth
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''
    const sql = `
      SELECT t.* FROM tasks t
      JOIN projects p ON p.id = t.project_id AND p.archived = 0
      ${whereSql}
      ORDER BY CASE t.status WHEN 'in_progress' THEN 0 WHEN 'todo' THEN 1 WHEN 'done' THEN 2 ELSE 3 END,
               COALESCE(t.due_date, 9999999999999) ASC,
               COALESCE(t.updated_at, t.created_at) DESC
    `
    const rows = db.prepare(sql).all(params) as Array<Omit<TaskRow, 'participants'> & { participants: string | null }>
    return rows.map((r) => ({ ...r, participants: r.participants ? this.safeParseJsonArray(r.participants) : [] }))
  }

  private safeParseJsonArray(value: string | null): string[] {
    if (!value) return []
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
    } catch {
      return []
    }
  }
}

function clampProgress(value: unknown): number {
  const n = typeof value === 'number' ? value : 0
  if (!Number.isFinite(n)) return 0
  return Math.min(100, Math.max(0, Math.round(n)))
}


