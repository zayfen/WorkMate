<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import SegmentedControl from '@/components/segmented-control/segmented-control.vue'
import DayView from '@/components/day-view/day-view.vue'
import WeekView from '@/components/week-view/week-view.vue'
import MonthView from '@/components/month-view/month-view.vue'
import YearView from '@/components/year-view/year-view.vue'
import TasksList from '@/components/tasks-list/tasks-list.vue'
import TaskEditorModal from '@/components/task-editor-modal/task-editor-modal.vue'

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

type WeekDayStat = { date: number, label: string, total: number, done: number, in_progress: number, todo: number, isToday?: boolean }
type HalfStat = { year: number, half: 1 | 2, label: string, total: number, done: number, in_progress: number, todo: number }

const mode = ref<'day' | 'week' | 'month' | 'year'>('week')
const options = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' }
]

// projects
const projects = ref<Array<{ id: number, title: string }>>([])
const projectsMap = computed<Record<number, string>>(() => Object.fromEntries(projects.value.map(p => [p.id, p.title])))

// raw tasks, fetched once and filtered by time windows
const allTasks = ref<TaskItem[]>([])

// UI states
const loading = ref(false)
const listOpen = ref(false)
const listTitle = ref('')
const listTasks = ref<TaskItem[]>([])
const editorOpen = ref(false)
const editingTask = ref<TaskItem | null>(null)

// date helpers
function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
function isTodayTs(ts: number): boolean {
  const now = Date.now()
  return startOfDay(ts) === startOfDay(now)
}
function getMonday(ts: number): number {
  const d = new Date(startOfDay(ts))
  const dow = d.getDay() || 7
  return startOfDay(d.getTime() - (dow - 1) * 24 * 60 * 60 * 1000)
}
// daysInMonth reserved helper (currently unused)

// fetch
async function fetchProjects() {
  try {
    const list = await window.api?.listProjects?.(false)
    projects.value = Array.isArray(list) ? list.map(p => ({ id: p.id, title: p.title })) : []
  } catch {
    projects.value = []
  }
}

async function fetchAllTasks() {
  loading.value = true
  try {
    const list = await window.api?.listTasks?.({ due: 'all', includeDone: true })
    allTasks.value = Array.isArray(list) ? list.filter(t => typeof t.due_date === 'number') : []
  } catch {
    allTasks.value = []
  } finally {
    loading.value = false
  }
}

// derive: today tasks (not done)
const todayTasks = computed<TaskItem[]>(() => {
  const s = startOfDay(Date.now())
  const e = s + 24 * 60 * 60 * 1000 - 1
  return allTasks.value.filter(t => t.due_date && t.due_date >= s && t.due_date <= e && t.status !== 'done')
})

// derive: week stats (Mon..Sun)
const weekStats = computed<WeekDayStat[]>(() => {
  const monday = getMonday(Date.now())
  const days: WeekDayStat[] = []
  for (let i = 0; i < 7; i++) {
    const dStart = monday + i * 24 * 60 * 60 * 1000
    days.push({ date: dStart, label: `周${['一','二','三','四','五','六','日'][i]}`, total: 0, done: 0, in_progress: 0, todo: 0, isToday: isTodayTs(dStart) })
  }
  const s = monday
  const e = monday + 7 * 24 * 60 * 60 * 1000 - 1
  const pool = allTasks.value.filter(t => t.due_date && t.due_date >= s && t.due_date <= e)
  const map = new Map<number, WeekDayStat>(days.map(d => [d.date, d]))
  for (const t of pool) {
    const k = startOfDay(t.due_date!)
    const stat = map.get(k)
    if (!stat) continue
    stat.total++
    if (t.status === 'done') stat.done++
    else if (t.status === 'in_progress') stat.in_progress++
    else stat.todo++
  }
  return days
})

// (reserved) month day stats if needed elsewhere

// derive: month cards (12 months of current year) for Month view
const monthCards = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const yearStart = new Date(year, 0, 1).getTime()
  const yearEnd = new Date(year, 11, 31).setHours(23, 59, 59, 999)
  const pool = allTasks.value.filter(t => t.due_date && t.due_date >= yearStart && t.due_date <= yearEnd)
  return Array.from({ length: 12 }, (_, m) => {
    const first = new Date(year, m, 1).getTime()
    const last = new Date(year, m + 1, 0).setHours(23, 59, 59, 999)
    let total = 0, done = 0, in_progress = 0, todo = 0
    for (const t of pool) {
      const dd = t.due_date!
      if (dd < first || dd > last) continue
      total++
      if (t.status === 'done') done++
      else if (t.status === 'in_progress') in_progress++
      else todo++
    }
    return { year, month: m, label: ['一','二','三','四','五','六','七','八','九','十','十一','十二'][m], total, done, in_progress, todo }
  })
})

// derive: year halves cards for Year view
const yearHalves = computed<HalfStat[]>(() => {
  const now = new Date()
  const year = now.getFullYear()
  const yearStart = new Date(year, 0, 1).getTime()
  const yearEnd = new Date(year, 11, 31).setHours(23, 59, 59, 999)
  const pool = allTasks.value.filter(t => t.due_date && t.due_date >= yearStart && t.due_date <= yearEnd)

  const ranges = [
    { half: 1 as 1 | 2, start: new Date(year, 0, 1).getTime(), end: new Date(year, 5, 30).setHours(23, 59, 59, 999), label: '上半年' },
    { half: 2 as 1 | 2, start: new Date(year, 6, 1).getTime(), end: new Date(year, 11, 31).setHours(23, 59, 59, 999), label: '下半年' }
  ]

  return ranges.map(r => {
    let total = 0, done = 0, in_progress = 0, todo = 0
    for (const t of pool) {
      const dd = t.due_date!
      if (dd < r.start || dd > r.end) continue
      total++
      if (t.status === 'done') done++
      else if (t.status === 'in_progress') in_progress++
      else todo++
    }
    return { year, half: r.half, label: r.label, total, done, in_progress, todo }
  })
})

// interactions
function openDayList(date: number) {
  const s = startOfDay(date)
  const e = s + 24 * 60 * 60 * 1000 - 1
  listTitle.value = `任务 · ${new Date(s).toLocaleDateString()}`
  listTasks.value = allTasks.value.filter(t => t.due_date && t.due_date >= s && t.due_date <= e && t.status !== 'done')
  listOpen.value = true
}

function openMonthListYM(year: number, monthIdx: number) {
  const first = new Date(year, monthIdx, 1).getTime()
  const last = new Date(year, monthIdx + 1, 0).setHours(23, 59, 59, 999)
  listTitle.value = `任务 · ${year}-${String(monthIdx + 1).padStart(2, '0')}`
  listTasks.value = allTasks.value.filter(t => t.due_date && t.due_date >= first && t.due_date <= last && t.status !== 'done')
  listOpen.value = true
}

function openHalfList(year: number, half: 1 | 2) {
  const start = half === 1 ? new Date(year, 0, 1).getTime() : new Date(year, 6, 1).getTime()
  const end = half === 1 ? new Date(year, 5, 30).setHours(23, 59, 59, 999) : new Date(year, 11, 31).setHours(23, 59, 59, 999)
  listTitle.value = `任务 · ${year}${half === 1 ? '上半年' : '下半年'}`
  listTasks.value = allTasks.value.filter(t => t.due_date && t.due_date >= start && t.due_date <= end && t.status !== 'done')
  listOpen.value = true
}

function onDayTaskClick(task: TaskItem) {
  editingTask.value = task
  editorOpen.value = true
}

async function updateTaskStatus(payload: { task: TaskItem, status: TaskStatus }) {
  if (typeof window.api?.updateTask !== 'function') return
  const ok = await window.api.updateTask({ id: payload.task.id, status: payload.status })
  if (ok) await fetchAllTasks()
}
async function updateTaskPriority(payload: { task: TaskItem, priority: TaskPriority }) {
  if (typeof window.api?.updateTask !== 'function') return
  const ok = await window.api.updateTask({ id: payload.task.id, priority: payload.priority })
  if (ok) await fetchAllTasks()
}
async function removeTask(task: TaskItem) {
  if (!confirm(`确认删除任务「${task.title}」？此操作不可恢复`)) return
  const ok = await window.api?.deleteTask?.(task.id)
  if (ok) await fetchAllTasks()
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAllTasks()])
})
</script>

<template>
  <div class='calendar'>
    <SegmentedControl v-model='mode' :options='options' />
    <div class='calendar-body'>
      <DayView
        v-if="mode==='day'"
        :tasks='todayTasks'
        @task-click='onDayTaskClick'
      />
      <WeekView
        v-else-if="mode==='week'"
        :days='weekStats'
        @day-click='({ date }) => openDayList(date)'
      />
      <MonthView
        v-else-if="mode==='month'"
        :months='monthCards'
        @month-click='({ year, month }) => openMonthListYM(year, month)'
      />
      <YearView
        v-else
        :halves='yearHalves'
        @half-click='({ year, half }) => openHalfList(year, half)'
      />
    </div>

    <!-- Inline panel for picked day/month list -->
    <div v-if='listOpen' class='list-panel'>
      <div class='panel-head'>
        <div class='title'>{{ listTitle }}</div>
        <button class='link' @click='listOpen=false'>关闭</button>
      </div>
      <TasksList
        :tasks='listTasks'
        :projects-map='projectsMap'
        @update-status='updateTaskStatus'
        @update-priority='updateTaskPriority'
        @edit='t => { editingTask=t; editorOpen=true }'
        @delete='removeTask'
      />
    </div>

    <!-- Task editor -->
    <TaskEditorModal
      :open='editorOpen'
      :task='editingTask'
      :projects='projects'
      @close='editorOpen=false'
      
      @saved='() => { editorOpen=false; fetchAllTasks() }'
      @deleted='() => { editorOpen=false; fetchAllTasks() }'
    />
  </div>
</template>

<style scoped>
.calendar { display: flex; flex-direction: column; gap: 12px }
.calendar-body { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.list-panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px }
.title { font-weight: 600 }
.link { background: transparent; border: none; color: #2563eb; cursor: pointer }
</style>


