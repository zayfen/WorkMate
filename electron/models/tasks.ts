import { DatabaseManager } from './db'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface TaskRecord {
  id?: number
  project_id: number
  title: string
  status?: TaskStatus
  created_at?: number
  updated_at?: number | null
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
}


