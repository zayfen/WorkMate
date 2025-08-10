import { describe, it, expect, vi } from 'vitest'
import { setupLanTaskCompleteNotifications, maybeBroadcastTaskComplete } from '../../electron/services/lan/task-complete'

describe('LAN task-complete notification & broadcast', () => {
  it('receives task-complete and triggers system notification + beep', () => {
    const handlers: Array<(msg: any) => void> = []
    const lan = {
      onTaskComplete: (h: (msg: any) => void) => { handlers.push(h); return () => {} }
    }
    const notify = vi.fn()
    const beep = vi.fn()

    setupLanTaskCompleteNotifications(lan as any, notify, beep)

    const msg = { type: 'task-complete', from: 'peer-a', fromName: 'Alice', taskId: 1, taskTitle: '写日报', ts: Date.now() }
    handlers.forEach((h) => h(msg))

    expect(notify).toHaveBeenCalledTimes(1)
    expect(notify).toHaveBeenCalledWith('任务完成', 'Alice 完成了任务「写日报」')
    expect(beep).toHaveBeenCalledTimes(1)
  })

  it('broadcasts when task status transitions to done (and not otherwise)', () => {
    const sent: any[] = []
    const lan = {
      sendTaskComplete: (p: any) => sent.push(p)
    }

    const before = { id: 7, title: '实现功能', status: 'in_progress' as const }
    const afterSame = { id: 7, title: '实现功能', status: 'in_progress' as const }
    const afterDone = { id: 7, title: '实现功能', status: 'done' as const }

    maybeBroadcastTaskComplete(lan as any, before, afterSame)
    expect(sent.length).toBe(0)

    maybeBroadcastTaskComplete(lan as any, before, afterDone)
    expect(sent.length).toBe(1)
    expect(sent[0]).toEqual({ taskId: 7, taskTitle: '实现功能' })

    // already done before → no broadcast
    maybeBroadcastTaskComplete(lan as any, { id: 8, title: '已完成', status: 'done' as const }, { id: 8, title: '已完成', status: 'done' as const })
    expect(sent.length).toBe(1)
  })
})


