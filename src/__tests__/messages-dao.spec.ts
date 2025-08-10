import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { DatabaseManager } from '../../electron/models/db'
import { MessagesDao, formatDayKey } from '../../electron/models/messages'

describe('MessagesDao', () => {
  beforeEach(() => {
    DatabaseManager.initialize(':memory:')
  })

  afterAll(() => {
    DatabaseManager.close()
  })

  it('creates and lists today messages', () => {
    const dao = new MessagesDao()
    const now = Date.now()
    const id1 = dao.create({ from_device_id: 'me', text: 'hello', ts: now })
    const id2 = dao.create({ from_device_id: 'peer', to_device_id: 'me', text: 'world', ts: now + 10 })
    expect(id1).toBeGreaterThan(0)
    expect(id2).toBeGreaterThan(0)
    const list = dao.listToday()
    expect(list.length).toBe(2)
    expect(list[0].text).toBe('hello')
    expect(list[1].text).toBe('world')
    expect(list.every(m => m.day_key === formatDayKey(now))).toBe(true)
  })

  it('purges not today', () => {
    const dao = new MessagesDao()
    // one for yesterday
    const yesterday = Date.now() - 24 * 60 * 60 * 1000
    dao.create({ from_device_id: 'me', text: 'old', ts: yesterday })
    // one for today
    dao.create({ from_device_id: 'me', text: 'new' })
    dao.purgeNotToday()
    const list = dao.listToday()
    expect(list.length).toBe(1)
    expect(list[0].text).toBe('new')
  })
})


