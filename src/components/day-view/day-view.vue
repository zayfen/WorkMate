<script setup lang='ts'>
import EventChip from '@/components/event-chip/event-chip.vue'

type TaskStatus = 'todo' | 'in_progress' | 'done'

type TaskItem = {
  id: number
  project_id: number
  title: string
  description: string | null
  participants: string[]
  due_date: number | null
  priority: 'low' | 'medium' | 'high'
  status: TaskStatus
  note: string | null
  created_at: number
  updated_at: number | null
}

const props = defineProps<{ tasks: TaskItem[] }>()
const emit = defineEmits<{ 'task-click': [task: TaskItem] }>()

const hours = Array.from({ length: 24 }, (_, h) => h)

function hourOf(ts: number | null): number {
  if (!ts) return 23
  const d = new Date(ts)
  return d.getHours()
}

function rowStartFor(task: TaskItem): number {
  return hourOf(task.due_date) + 1
}

function onChipClick(task: TaskItem) {
  emit('task-click', task)
}
</script>

<template>
  <div class='day'>
    <div v-if='props.tasks.length === 0' class='empty'>今天没有未开始或进行中的任务</div>
    <div v-else class='timeline'>
      <div v-for='h in hours' :key='h' class='slot'>
        <span class='time'>{{ String(h).padStart(2, '0') }}:00</span>
        <div class='line' />
      </div>

      <div
        v-for='t in props.tasks'
        :key='t.id'
        class='chip-wrap'
        :style="{ gridRow: `${rowStartFor(t)} / span 1` }"
        @click='onChipClick(t)'
      >
        <span class='status-dot' :class="t.status === 'in_progress' ? 'blue' : 'amber'" />
        <div class='chip-flex'>
          <EventChip :label='t.title' :priority='t.priority' />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.day { max-height: 520px; overflow: auto }
.empty { color: #6b7280; font-size: 12px; padding: 8px 4px }
.timeline { position: relative; display: grid; grid-template-rows: repeat(24, 40px); gap: 8px }
.slot { display: grid; grid-template-columns: 60px 1fr; align-items: center; gap: 8px }
.time { color: #6b7280; font-size: 12px; justify-self: end }
.line { height: 1px; background: #e5e7eb }
.chip-wrap { grid-column: 2 / -1; align-self: center; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; z-index: 1 }
.chip-flex { flex: 1 1 auto; width: 100% }
.status-dot { width: 8px; height: 8px; border-radius: 50% }
.status-dot.blue { background: #3b82f6 }
.status-dot.amber { background: #f59e0b }
</style>


