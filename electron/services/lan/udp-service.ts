import dgram from 'node:dgram'
import os from 'node:os'
import { PresenceRegistry, tryParsePacket, HeartbeatMessage, ChatMessage, TaskCompleteMessage } from './presence'

export type UdpLanOptions = {
  multicastAddress?: string
  port?: number
  heartbeatIntervalMs?: number
  offlineAfterMs?: number
}

export class UdpLanService {
  private readonly socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
  private readonly options: Required<UdpLanOptions>
  private readonly presence: PresenceRegistry
  private heartbeatTimer: NodeJS.Timeout | null = null
  private readonly deviceId: string
  private readonly name: string
  private onChatHandlers: Array<(msg: ChatMessage) => void> = []
  private onTaskCompleteHandlers: Array<(msg: TaskCompleteMessage) => void> = []

  constructor(params: { deviceId: string; name: string; options?: UdpLanOptions }) {
    const defaults: Required<UdpLanOptions> = {
      multicastAddress: '239.255.255.250',
      port: 53210,
      heartbeatIntervalMs: 3000,
      offlineAfterMs: 10000
    }
    this.options = Object.assign({}, defaults, params.options)
    this.presence = new PresenceRegistry(this.options.offlineAfterMs)
    this.deviceId = params.deviceId
    this.name = params.name
  }

  async start(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.socket.on('listening', () => {
        try {
          this.socket.addMembership(this.options.multicastAddress)
        } catch {}
        this.socket.setBroadcast(true)
        resolve()
      })
      this.socket.on('message', (msg, rinfo) => {
        const packet = tryParsePacket(msg)
        if (!packet) return
        if (packet.type === 'heartbeat') {
          this.presence.upsertHeartbeat({ deviceId: packet.deviceId, name: packet.name, ip: rinfo.address, port: packet.port })
        } else if (packet.type === 'chat') {
          // ignore messages from self
          if (packet.from === this.deviceId) return
          // if message is direct to someone else, ignore
          if (packet.to && packet.to !== this.deviceId) return
          this.onChatHandlers.forEach((h) => h(packet))
        } else if (packet.type === 'task-complete') {
          if (packet.from === this.deviceId) return
          this.onTaskCompleteHandlers.forEach((h) => h(packet))
        }
      })
      this.socket.bind(this.options.port, () => {})
    })

    // Schedule heartbeats
    this.heartbeatTimer = setInterval(() => this.broadcastHeartbeat(), this.options.heartbeatIntervalMs)
    // Send initial heartbeat
    this.broadcastHeartbeat()
  }

  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    try { this.socket.close() } catch {}
  }

  getOnlinePeers(): Array<{ deviceId: string; name: string; ip: string; port: number; lastSeen: number }> {
    this.presence.sweep()
    return this.presence.listOnline()
  }

  onChat(handler: (msg: ChatMessage) => void): () => void {
    this.onChatHandlers.push(handler)
    return () => {
      this.onChatHandlers = this.onChatHandlers.filter((h) => h !== handler)
    }
  }

  sendChat(text: string, toDeviceId?: string): void {
    const packet: ChatMessage = { type: 'chat', from: this.deviceId, to: toDeviceId, text, ts: Date.now() }
    const buf = Buffer.from(JSON.stringify(packet))
    this.socket.send(buf, 0, buf.length, this.options.port, this.options.multicastAddress)
  }

  onTaskComplete(handler: (msg: TaskCompleteMessage) => void): () => void {
    this.onTaskCompleteHandlers.push(handler)
    return () => {
      this.onTaskCompleteHandlers = this.onTaskCompleteHandlers.filter((h) => h !== handler)
    }
  }

  sendTaskComplete(payload: { taskId: number; taskTitle: string }): void {
    const packet: TaskCompleteMessage = {
      type: 'task-complete',
      from: this.deviceId,
      fromName: this.name,
      taskId: Number(payload.taskId),
      taskTitle: String(payload.taskTitle || '').slice(0, 200),
      ts: Date.now()
    }
    const buf = Buffer.from(JSON.stringify(packet))
    this.socket.send(buf, 0, buf.length, this.options.port, this.options.multicastAddress)
  }

  private broadcastHeartbeat(): void {
    const port = this.options.port
    const payload: HeartbeatMessage = { type: 'heartbeat', deviceId: this.deviceId, name: this.name, port, ts: Date.now() }
    const buf = Buffer.from(JSON.stringify(payload))
    // send on each interface broadcast
    const ifaces = os.networkInterfaces()
    for (const infos of Object.values(ifaces)) {
      if (!infos) continue
      for (const info of infos) {
        if (info.family === 'IPv4' && !info.internal) {
          try {
            this.socket.send(buf, 0, buf.length, port, this.options.multicastAddress)
          } catch {}
        }
      }
    }
  }
}


