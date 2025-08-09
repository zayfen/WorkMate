import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { DatabaseManager } from '../../electron/models/db'
import { SettingsDao } from '../../electron/models/settings'

describe('SettingsDao', () => {
  beforeEach(() => {
    DatabaseManager.initialize(':memory:')
  })

  afterAll(() => {
    DatabaseManager.close()
  })

  it('set/get roundtrip', () => {
    const dao = new SettingsDao()
    dao.set('k1', 'v1')
    expect(dao.get('k1')).toBe('v1')
  })

  it('ensureDeviceId is stable', () => {
    const dao = new SettingsDao()
    const a = dao.ensureDeviceId()
    const b = dao.ensureDeviceId()
    expect(a).toBe(b)
    expect(a).toMatch(/[0-9a-fA-F-]{36}/)
  })
})


