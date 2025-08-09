import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { DatabaseManager } from '../../electron/models/db'
import { UsersDao } from '../../electron/models/users'

describe('UsersDao', () => {
  beforeEach(() => {
    DatabaseManager.initialize(':memory:')
  })

  afterAll(() => {
    DatabaseManager.close()
  })

  it('creates and reads a user by local_id', () => {
    const dao = new UsersDao()
    const localId = 'u1'
    const id = dao.createUser({ name: 'Alice', local_id: localId, avatar_path: null, avatar_base64: null, note: 'hi', device_info: null })
    expect(id).toBeGreaterThan(0)
    const user = dao.getUserByLocalId(localId)
    expect(user).toBeTruthy()
    expect(user!.name).toBe('Alice')
    expect(user!.local_id).toBe(localId)
  })

  it('updates name and note and bumps last_seen', async () => {
    const dao = new UsersDao()
    const localId = 'u2'
    dao.createUser({ name: 'Bob', local_id: localId, avatar_path: null, avatar_base64: null, note: null, device_info: null })
    const before = dao.getUserByLocalId(localId)!
    // sleep 5ms to ensure timestamp change
    await new Promise((r) => setTimeout(r, 5))
    dao.updateUserByLocalId(localId, { name: 'Bobby', note: 'updated' })
    const after = dao.getUserByLocalId(localId)!
    expect(after.name).toBe('Bobby')
    expect(after.note).toBe('updated')
    expect(after.last_seen!).toBeGreaterThanOrEqual(before.last_seen!)
  })

  it('stores avatar_base64 and reads it back', () => {
    const dao = new UsersDao()
    const localId = 'u3'
    const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=='
    dao.createUser({ name: 'Carol', local_id: localId, avatar_path: null, avatar_base64: null, note: null, device_info: null })
    dao.updateUserByLocalId(localId, { avatar_base64: base64 })
    const user = dao.getUserByLocalId(localId)!
    expect(user.avatar_base64).toBe(base64)
  })
})


