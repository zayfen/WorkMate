import { DatabaseManager } from './db'

export interface UserRecord {
  id?: number
  name: string
  avatar_path?: string | null
  avatar_base64?: string | null
  note?: string | null
  local_id: string
  last_seen?: number
  device_info?: string | null
}

export class UsersDao {
  createUser(user: Omit<UserRecord, 'id' | 'last_seen'>): number {
    const db = DatabaseManager.getDatabase()
    const stmt = db.prepare(
      `INSERT INTO users (name, avatar_path, avatar_base64, note, local_id, device_info) VALUES (@name, @avatar_path, @avatar_base64, @note, @local_id, @device_info)`
    )
    const info = stmt.run({
      name: user.name,
      avatar_path: user.avatar_path ?? null,
      avatar_base64: user.avatar_base64 ?? null,
      note: user.note ?? null,
      local_id: user.local_id,
      device_info: user.device_info ?? null
    })
    return Number(info.lastInsertRowid)
  }

  getUserByLocalId(localId: string): UserRecord | null {
    const db = DatabaseManager.getDatabase()
    const row = db.prepare(`SELECT * FROM users WHERE local_id = ?`).get(localId) as UserRecord | undefined
    return row ?? null
  }

  updateUserByLocalId(localId: string, fields: Partial<Omit<UserRecord, 'id' | 'local_id'>>): void {
    const db = DatabaseManager.getDatabase()
    const updates: string[] = []
    const params: Record<string, unknown> = {}

    if (fields.name !== undefined) { updates.push('name = @name'); params.name = fields.name }
    if (fields.avatar_path !== undefined) { updates.push('avatar_path = @avatar_path'); params.avatar_path = fields.avatar_path }
    if (fields.avatar_base64 !== undefined) { updates.push('avatar_base64 = @avatar_base64'); params.avatar_base64 = fields.avatar_base64 }
    if (fields.note !== undefined) { updates.push('note = @note'); params.note = fields.note }
    if (fields.device_info !== undefined) { updates.push('device_info = @device_info'); params.device_info = fields.device_info }

    // Always bump last_seen on profile update
    updates.push(`last_seen = strftime('%s','now')*1000`)

    if (updates.length === 0) return
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE local_id = @local_id`
    params.local_id = localId
    db.prepare(sql).run(params)
  }
}


