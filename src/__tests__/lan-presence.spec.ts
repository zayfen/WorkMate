import { describe, it, expect } from 'vitest'
import { PresenceRegistry, tryParsePacket } from '../../electron/services/lan/presence'

describe('PresenceRegistry', () => {
  it('tracks online peers and expires them after threshold', () => {
    const reg = new PresenceRegistry(1000)
    const t0 = 1_000_000
    reg.upsertHeartbeat({ deviceId: 'a', name: 'Alice', ip: '1.1.1.1', port: 1234, now: t0 })
    reg.upsertHeartbeat({ deviceId: 'b', name: 'Bob', ip: '1.1.1.2', port: 1234, now: t0 })
    expect(reg.listOnline(t0).map(p => p.deviceId)).toEqual(['a', 'b'])

    // advance just within threshold
    const t1 = t0 + 900
    expect(reg.listOnline(t1).length).toBe(2)

    // advance beyond threshold, only those with refresh remain
    const t2 = t0 + 1100
    // refresh 'a'
    reg.upsertHeartbeat({ deviceId: 'a', name: 'Alice', ip: '1.1.1.1', port: 1234, now: t2 })
    reg.sweep(t2)
    const online = reg.listOnline(t2)
    expect(online.length).toBe(1)
    expect(online[0].deviceId).toBe('a')
  })
})

describe('tryParsePacket', () => {
  it('parses heartbeat and chat packets', () => {
    const hb = JSON.stringify({ type: 'heartbeat', deviceId: 'x', name: 'X', port: 123, ts: 1 })
    const chat = JSON.stringify({ type: 'chat', from: 'x', to: 'y', text: 'hi', ts: 2 })
    expect(tryParsePacket(hb)).toMatchObject({ type: 'heartbeat', deviceId: 'x' })
    expect(tryParsePacket(chat)).toMatchObject({ type: 'chat', from: 'x', text: 'hi' })
    expect(tryParsePacket('oops')).toBeNull()
  })
})


