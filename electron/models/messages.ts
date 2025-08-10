import { DatabaseManager } from './db'

export interface MessageRecord {
  id?: number
  from_device_id: string
  to_device_id?: string | null
  text: string
  ts: number
  day_key: string
}

export function formatDayKey(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export class MessagesDao {
  constructor() {
    const db = DatabaseManager.getDatabase()
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_device_id TEXT NOT NULL,
        to_device_id TEXT,
        text TEXT NOT NULL,
        ts INTEGER NOT NULL,
        day_key TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_messages_day_key ON messages(day_key);
      CREATE INDEX IF NOT EXISTS idx_messages_from_to ON messages(from_device_id, to_device_id);
    `)
  }

  create(payload: { from_device_id: string; to_device_id?: string | null; text: string; ts?: number }): number {
    const db = DatabaseManager.getDatabase()
    const ts = typeof payload.ts === 'number' ? payload.ts : Date.now()
    const day_key = formatDayKey(ts)
    const stmt = db.prepare(`INSERT INTO messages (from_device_id, to_device_id, text, ts, day_key) VALUES (?, ?, ?, ?, ?)`)
    const info = stmt.run(payload.from_device_id, payload.to_device_id ?? null, String(payload.text).slice(0, 2000), ts, day_key)
    return Number(info.lastInsertRowid)
  }

  listToday(): MessageRecord[] {
    const db = DatabaseManager.getDatabase()
    const day_key = formatDayKey(Date.now())
    const rows = db.prepare(`SELECT * FROM messages WHERE day_key = ? ORDER BY ts ASC`).all(day_key) as MessageRecord[]
    return rows
  }

  listTodayWithPeer(deviceIdA: string, deviceIdB: string): MessageRecord[] {
    const db = DatabaseManager.getDatabase()
    const day_key = formatDayKey(Date.now())
    const rows = db
      .prepare(
        `SELECT * FROM messages
         WHERE day_key = ? AND (
           (from_device_id = @a AND (to_device_id = @b OR to_device_id IS NULL)) OR
           (from_device_id = @b AND (to_device_id = @a OR to_device_id IS NULL))
         )
         ORDER BY ts ASC`
      )
      .all({ a: deviceIdA, b: deviceIdB, day_key }) as MessageRecord[]
    return rows
  }

  purgeNotToday(): void {
    const db = DatabaseManager.getDatabase()
    const day_key = formatDayKey(Date.now())
    db.prepare(`DELETE FROM messages WHERE day_key != ?`).run(day_key)
  }
}


