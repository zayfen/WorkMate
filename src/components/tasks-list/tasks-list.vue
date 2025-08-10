<script setup lang='ts'>
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

type TaskStatus = 'todo' | 'in_progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

type TaskItem = {
  id: number
  project_id: number
  title: string
  description: string | null
  participants: string[]
  due_date: number | null
  priority: TaskPriority
  status: TaskStatus
  note: string | null
  created_at: number
  updated_at: number | null
}

const props = defineProps<{
  tasks: TaskItem[]
  projectsMap: Record<number, string>
}>()

const emit = defineEmits<{
  edit: [task: TaskItem]
  delete: [task: TaskItem]
  'update-status': [payload: { task: TaskItem, status: TaskStatus }]
  'update-priority': [payload: { task: TaskItem, priority: TaskPriority }]
}>()

function formatDate(ts?: number | null): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

function statusText(s: TaskStatus): string {
  return s === 'in_progress' ? '进行中' : s === 'done' ? '已完成' : '未开始'
}

function priorityText(p: TaskPriority): string {
  return p === 'high' ? '高' : p === 'low' ? '低' : '中'
}

function onChangeStatus(task: TaskItem, value: TaskStatus) {
  emit('update-status', { task, status: value })
}

function onChangePriority(task: TaskItem, value: TaskPriority) {
  emit('update-priority', { task, priority: value })
}
</script>

<template>
  <div>
    <div class='row head'>
      <div class='cell'>标题</div>
      <div class='cell'>项目</div>
      <div class='cell'>负责人</div>
      <div class='cell'>截止</div>
      <div class='cell'>状态</div>
      <div class='cell'>优先级</div>
      <div class='cell actions'>操作</div>
    </div>
    <RecycleScroller
      class='scroller'
      :items='props.tasks'
      :item-size='56'
      key-field='id'
      v-slot='{ item: t }'
    >
      <div class='row' :class="['status', t.status]" :key='t.id'>
        <div class='cell title'>{{ t.title }}</div>
        <div class='cell'>{{ props.projectsMap[t.project_id] || '-' }}</div>
        <div class='cell'>{{ t.participants?.join('、') || '-' }}</div>
        <div class='cell'>{{ formatDate(t.due_date) }}</div>
        <div class='cell'>
          <select class='mini-select' :value='t.status' @change="onChangeStatus(t, ($event.target as HTMLSelectElement).value as TaskStatus)">
            <option value='todo'>未开始</option>
            <option value='in_progress'>进行中</option>
            <option value='done'>已完成</option>
          </select>
        </div>
        <div class='cell'>
          <select class='mini-select' :value='t.priority' @change="onChangePriority(t, ($event.target as HTMLSelectElement).value as TaskPriority)">
            <option value='high'>高</option>
            <option value='medium'>中</option>
            <option value='low'>低</option>
          </select>
        </div>
        <div class='cell actions'>
          <button class='link' @click="emit('edit', t)">编辑</button>
          <button class='link danger' @click="emit('delete', t)">删除</button>
        </div>
      </div>
    </RecycleScroller>
  </div>
</template>

<style scoped>
.row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 0.8fr 0.8fr 0.8fr; align-items: center; min-height: 48px; padding: 0 8px; border-radius: 12px }
.row.head { color: #6b7280 }
.row:not(.head):hover { background: rgba(0,0,0,0.03) }
.cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.cell.title { font-weight: 600 }
.actions { display: flex; gap: 8px; justify-content: flex-end }
.link { background: transparent; border: none; color: #2563eb; cursor: pointer }
.link.danger { color: #dc2626 }
.prio { display: inline-block; min-width: 40px; text-align: center; font-size: 12px; padding: 2px 6px; border-radius: 999px; color: #111 }
.prio.high { background: #fee2e2; color: #991b1b }
.prio.medium { background: #fef3c7; color: #92400e }
.prio.low { background: #e0f2fe; color: #075985 }
.status.todo { border-left: 3px solid #f59e0b }
.status.in_progress { border-left: 3px solid #3b82f6 }
.status.done { border-left: 3px solid #10b981 }
.mini-select { padding: 4px 6px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 12px }
.scroller { height: 60vh; overflow: auto }
</style>


