export type PeerInfo = {
  deviceId: string
  name: string
  ip: string
  port: number
  lastSeen: number
}

/**
 * Pure presence registry: keeps online peers by lastSeen heartbeat.
 * This class is pure TS (no Node deps) so it can be unit-tested easily.
 */
export class PresenceRegistry {
  private peersById: Map<string, PeerInfo> = new Map()
  private readonly offlineAfterMs: number

  constructor(offlineAfterMs = 1000 * 10) {
    this.offlineAfterMs = offlineAfterMs
  }

  upsertHeartbeat(payload: { deviceId: string; name: string; ip: string; port: number; now?: number }): PeerInfo {
    const now = payload.now ?? Date.now()
    const existing = this.peersById.get(payload.deviceId)
    const next: PeerInfo = {
      deviceId: payload.deviceId,
      name: payload.name,
      ip: payload.ip,
      port: payload.port,
      lastSeen: now
    }
    if (!existing || existing.ip !== next.ip || existing.port !== next.port || existing.name !== next.name) {
      this.peersById.set(payload.deviceId, next)
    } else {
      existing.lastSeen = now
      this.peersById.set(payload.deviceId, existing)
    }
    return this.peersById.get(payload.deviceId)!
  }

  remove(deviceId: string): void {
    this.peersById.delete(deviceId)
  }

  listOnline(now: number = Date.now()): PeerInfo[] {
    const online: PeerInfo[] = []
    for (const p of this.peersById.values()) {
      if (now - p.lastSeen <= this.offlineAfterMs) online.push(p)
    }
    // Sort by most recently seen
    online.sort((a, b) => b.lastSeen - a.lastSeen)
    return online
  }

  sweep(now: number = Date.now()): void {
    for (const [id, p] of this.peersById.entries()) {
      if (now - p.lastSeen > this.offlineAfterMs) this.peersById.delete(id)
    }
  }
}

export type HeartbeatMessage = {
  type: 'heartbeat'
  deviceId: string
  name: string
  port: number
  ts: number
}

export type ChatMessage = {
  type: 'chat'
  from: string
  to?: string
  text: string
  ts: number
}

export type LanPacket = HeartbeatMessage | ChatMessage

export function tryParsePacket(input: Buffer | string): LanPacket | null {
  try {
    const str = typeof input === 'string' ? input : input.toString('utf8')
    const obj = JSON.parse(str)
    if (!obj || typeof obj !== 'object') return null
    if (obj.type === 'heartbeat' && typeof obj.deviceId === 'string' && typeof obj.name === 'string' && typeof obj.port === 'number' && typeof obj.ts === 'number') {
      return obj as HeartbeatMessage
    }
    if (obj.type === 'chat' && typeof obj.from === 'string' && typeof obj.text === 'string' && typeof obj.ts === 'number') {
      return obj as ChatMessage
    }
    return null
  } catch {
    return null
  }
}


