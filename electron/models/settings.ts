import { DatabaseManager } from './db'
import { randomUUID } from 'node:crypto'

export class SettingsDao {
  get(key: string): string | null {
    const db = DatabaseManager.getDatabase()
    const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as { value: string } | undefined
    return row?.value ?? null
  }

  set(key: string, value: string): void {
    const db = DatabaseManager.getDatabase()
    db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value)
  }

  ensureDeviceId(): string {
    let id = this.get('device_id')
    if (!id) {
      id = randomUUID()
      this.set('device_id', id)
    }
    return id
  }
}


