import Database from 'better-sqlite3'
import { dirname } from 'node:path'
import { mkdirSync } from 'node:fs'

export type SqliteDatabase = Database.Database

/**
 * Centralized database manager for the Electron main process.
 * Tests should call initialize(':memory:') to use an in-memory database.
 */
export class DatabaseManager {
  private static instance: SqliteDatabase | null = null
  private static databasePath: string | null = null

  static initialize(databasePath: string): void {
    // Close previous instance if re-initialized (useful for tests)
    if (DatabaseManager.instance) {
      try { DatabaseManager.instance.close() } catch { /* ignore */ }
      DatabaseManager.instance = null
    }

    if (databasePath !== ':memory:') {
      try {
        mkdirSync(dirname(databasePath), { recursive: true })
      } catch {
        // ignore directory creation errors; path may already exist
      }
    }

    const db = new Database(databasePath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')

    DatabaseManager.instance = db
    DatabaseManager.databasePath = databasePath
    runMigrations(db)
  }

  static getDatabase(): SqliteDatabase {
    if (!DatabaseManager.instance) throw new Error('Database not initialized')
    return DatabaseManager.instance
  }

  static getPath(): string | null {
    return DatabaseManager.databasePath
  }

  static close(): void {
    if (DatabaseManager.instance) {
      try { DatabaseManager.instance.close() } catch { /* ignore */ }
      DatabaseManager.instance = null
    }
  }
}

function runMigrations(db: SqliteDatabase): void {
  // users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar_path TEXT,
      note TEXT,
      local_id TEXT UNIQUE NOT NULL,
      last_seen INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000),
      device_info TEXT
    );
  `)

  // Add avatar_base64 column if missing (migration for switching from path to base64)
  try {
    const columns = db.prepare(`PRAGMA table_info(users)`).all() as Array<{ name: string }>
    const hasAvatarBase64 = columns.some((c) => c.name === 'avatar_base64')
    if (!hasAvatarBase64) {
      db.exec(`ALTER TABLE users ADD COLUMN avatar_base64 TEXT`)
    }
  } catch {
    // ignore migration errors
  }

  // settings key-value table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  // projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000),
      archived INTEGER NOT NULL DEFAULT 0,
      estimated_end_at INTEGER,
      participants TEXT DEFAULT '[]'
    );
  `)

  // tasks table (minimal for counts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000),
      updated_at INTEGER,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
      CHECK (status IN ('todo','in_progress','done'))
    );
  `)

  // helpful indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
  `)
}


