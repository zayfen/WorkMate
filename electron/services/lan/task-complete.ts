import type { TaskCompleteMessage } from './presence'

export type NotifyFn = (title: string, body: string) => void
export type BeepFn = () => void

export interface LanLikeForReceive {
  onTaskComplete: (handler: (msg: TaskCompleteMessage) => void) => () => void
}

export interface LanLikeForSend {
  sendTaskComplete: (payload: { taskId: number; taskTitle: string }) => void
}

export type TaskRowLite = {
  id: number
  title: string
  status: 'todo' | 'in_progress' | 'done'
}

export function setupLanTaskCompleteNotifications(
  lan: LanLikeForReceive,
  notify: NotifyFn,
  beep: BeepFn
): () => void {
  return lan.onTaskComplete((msg) => {
    try {
      notify('任务完成', `${msg.fromName} 完成了任务「${msg.taskTitle}」`)
    } catch {}
    try { beep() } catch {}
  })
}

export function maybeBroadcastTaskComplete(
  lan: LanLikeForSend | null,
  before: TaskRowLite | null,
  after: TaskRowLite | null
): void {
  if (!lan || !after || !before) return
  if (before.status === 'done') return
  if (after.status !== 'done') return
  const title = String(after.title || '已完成任务').slice(0, 200)
  lan.sendTaskComplete({ taskId: after.id, taskTitle: title })
}


