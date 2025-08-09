import { DatabaseManager } from './db'

export interface ProjectRecord {
  id?: number
  title: string
  description?: string | null
  created_at?: number
  archived?: 0 | 1
  estimated_end_at?: number | null
  participants?: string[]
}

type DbProjectRow = {
  id: number
  title: string
  description: string | null
  created_at: number
  archived: number
  estimated_end_at: number | null
  participants: string | null // JSON string
}

export class ProjectsDao {
  create(project: Omit<ProjectRecord, 'id' | 'created_at' | 'archived'>): number {
    const db = DatabaseManager.getDatabase()
    const stmt = db.prepare(
      `INSERT INTO projects (title, description, estimated_end_at, participants) VALUES (@title, @description, @estimated_end_at, @participants)`
    )
    const info = stmt.run({
      title: project.title,
      description: project.description ?? null,
      estimated_end_at: project.estimated_end_at ?? null,
      participants: JSON.stringify(project.participants ?? [])
    })
    return Number(info.lastInsertRowid)
  }

  list(includeArchived: boolean): DbProjectRow[] {
    const db = DatabaseManager.getDatabase()
    if (includeArchived) {
      return db.prepare(`SELECT * FROM projects ORDER BY id DESC`).all() as DbProjectRow[]
    }
    return db.prepare(`SELECT * FROM projects WHERE archived = 0 ORDER BY id DESC`).all() as DbProjectRow[]
  }

  getById(id: number): DbProjectRow | null {
    const db = DatabaseManager.getDatabase()
    const row = db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as DbProjectRow | undefined
    return row ?? null
  }

  update(id: number, fields: Partial<Omit<ProjectRecord, 'id' | 'created_at'>>): void {
    const db = DatabaseManager.getDatabase()
    const updates: string[] = []
    const params: Record<string, unknown> = { id }

    if (fields.title !== undefined) { updates.push('title = @title'); params.title = fields.title }
    if (fields.description !== undefined) { updates.push('description = @description'); params.description = fields.description ?? null }
    if (fields.estimated_end_at !== undefined) { updates.push('estimated_end_at = @estimated_end_at'); params.estimated_end_at = fields.estimated_end_at ?? null }
    if (fields.participants !== undefined) { updates.push('participants = @participants'); params.participants = JSON.stringify(fields.participants ?? []) }
    if (fields.archived !== undefined) { updates.push('archived = @archived'); params.archived = fields.archived ? 1 : 0 }

    if (updates.length === 0) return
    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = @id`
    db.prepare(sql).run(params)
  }

  setArchived(id: number, archived: boolean): void {
    const db = DatabaseManager.getDatabase()
    db.prepare(`UPDATE projects SET archived = ? WHERE id = ?`).run(archived ? 1 : 0, id)
  }

  delete(id: number): void {
    const db = DatabaseManager.getDatabase()
    db.prepare(`DELETE FROM projects WHERE id = ?`).run(id)
  }
}


