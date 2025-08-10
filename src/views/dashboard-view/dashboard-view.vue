<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TodayTasksCard from '@/components/today-tasks-card/today-tasks-card.vue'
import UpcomingAlerts from '@/components/upcoming-alerts/upcoming-alerts.vue'
import WeeklyStats from '@/components/weekly-stats/weekly-stats.vue'
import QuickActions from '@/components/quick-actions/quick-actions.vue'
import StickyNote from '@/components/sticky-note/sticky-note.vue'
import type { RendererTask } from '@/utils/report-types'

type SimpleTask = { id: number, title: string, due: string, project: string, status: 'todo' | 'in_progress' | 'done' }
type AlertItem = { id: number, title: string, remain: string }

const router = useRouter()

const todayTasks = ref<SimpleTask[]>([])
const alerts = ref<AlertItem[]>([])
const weeklyDoneCount = ref(0)
const weeklyCompletionPercent = ref(0)
const weeklyTrendPercent = ref(0)

const projectsMap = ref<Record<number, string>>({})

function startOfToday(): number {
  return new Date(new Date(Date.now()).toDateString()).getTime()
}

function endOfToday(): number {
  return startOfToday() + 24 * 60 * 60 * 1000 - 1
}

function startOfWeek(ts: number): number {
  const start = new Date(new Date(ts).toDateString()).getTime()
  const dow = new Date(start).getDay() || 7
  return start - (dow - 1) * 24 * 60 * 60 * 1000
}

function endOfWeek(ts: number): number { return startOfWeek(ts) + 7 * 24 * 60 * 60 * 1000 - 1 }

function fmtDue(ts: number | null): string {
  if (!ts) return '未设定'
  const s = startOfToday(), e = endOfToday()
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (ts >= s && ts <= e) return `今天 ${hh}:${mm}`
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  return `${M}-${D} ${hh}:${mm}`
}

function remainText(ms: number): string {
  const h = Math.max(1, Math.ceil(ms / (60 * 60 * 1000)))
  return `剩余 ${h} 小时`
}

async function fetchProjects(): Promise<void> {
  try {
    const list = await window.api?.listProjects?.(false)
    const map: Record<number, string> = {}
    for (const p of list || []) map[p.id] = p.title
    projectsMap.value = map
  } catch {}
}

async function fetchTodayTasks(): Promise<void> {
  const tasks = await window.api?.listTasks?.({ due: 'today', includeDone: true })
  const map = projectsMap.value
  const list = (tasks ?? [])
    .map((t) => ({
      id: t.id,
      title: t.title,
      due: fmtDue(t.due_date),
      project: map[t.project_id] || `项目 ${t.project_id}`,
      status: (t.status === 'done' ? 'done' : (t.status === 'in_progress' ? 'in_progress' : 'todo')) as 'done' | 'in_progress' | 'todo'
    }))
  todayTasks.value = list.slice(0, 8)
}

function timeKeyForTask(t: RendererTask): number {
  return t.due_date ?? t.updated_at ?? t.created_at
}

async function computeWeeklyStats(): Promise<void> {
  const now = Date.now()
  // use activity time (due_date || updated_at || created_at) to determine week membership
  const all = await window.api?.listTasks?.({ includeDone: true })
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  const inThisWeek = (all ?? []).filter((t) => {
    const ts = timeKeyForTask(t)
    return ts >= weekStart && ts <= weekEnd
  })
  const total = inThisWeek.length
  const done = inThisWeek.filter((t) => t.status === 'done').length
  weeklyDoneCount.value = done
  weeklyCompletionPercent.value = total === 0 ? 0 : Math.round((done / total) * 100)

  // trend vs last week
  const prevStart = startOfWeek(now - 7 * 24 * 60 * 60 * 1000)
  const prevEnd = endOfWeek(now - 7 * 24 * 60 * 60 * 1000)
  const lastWeekDone = (all ?? []).filter((t) => t.status === 'done' && timeKeyForTask(t) >= prevStart && timeKeyForTask(t) <= prevEnd).length
  if (lastWeekDone === 0) {
    weeklyTrendPercent.value = done > 0 ? 100 : 0
  } else {
    weeklyTrendPercent.value = Math.round(((done - lastWeekDone) / lastWeekDone) * 100)
  }
}

async function computeUpcomingAlerts(): Promise<void> {
  const now = Date.now()
  const within = 24 * 60 * 60 * 1000
  const weekTasks = await window.api?.listTasks?.({ due: 'this_week' })
  const map = projectsMap.value
  const candidates = (weekTasks ?? []).filter((t) => typeof t.due_date === 'number' && t.due_date! > now && t.status !== 'done')
  candidates.sort((a, b) => (a.due_date ?? Infinity) - (b.due_date ?? Infinity))
  const top = candidates.filter((t) => (t.due_date as number) - now <= within).slice(0, 5)
  alerts.value = top.map((t) => ({ id: t.id, title: `${map[t.project_id] || '项目'}｜${t.title}`, remain: remainText((t.due_date as number) - now) }))
}

function goCreateTask(): void { router.push({ name: 'tasks' }) }
function goViewWeek(): void { router.push({ name: 'calendar' }) }
function goExportWeekly(): void { router.push({ name: 'reports' }) }

async function onAdvanceTask(payload: { id: number }): Promise<void> {
  const item = todayTasks.value.find((t) => t.id === payload.id)
  if (!item) return
  const nextStatus = item.status === 'in_progress' ? 'done' : 'in_progress'
  try {
    if (typeof window.api?.updateTask === 'function') {
      const ok = await window.api.updateTask({ id: payload.id, status: nextStatus })
      if (!ok) return
    }
  } finally {
    await Promise.all([
      fetchTodayTasks(),
      computeWeeklyStats(),
      computeUpcomingAlerts()
    ])
  }
}

onMounted(async () => {
  await fetchProjects()
  await Promise.all([
    fetchTodayTasks(),
    computeWeeklyStats(),
    computeUpcomingAlerts()
  ])
})
</script>

<template>
  <div class='dashboard'>
    <div class='grid'>
      <TodayTasksCard :tasks='todayTasks' @create-task='goCreateTask' @advance-task='onAdvanceTask' />
      <UpcomingAlerts :alerts='alerts' />
    </div>
    <div class='grid'>
      <WeeklyStats :done-count='weeklyDoneCount' :completion-percent='weeklyCompletionPercent' :trend-percent='weeklyTrendPercent' />
      <QuickActions @create-task='goCreateTask' @view-week='goViewWeek' @export-weekly-report='goExportWeekly' />
    </div>
    <StickyNote storageKey='sticky_note_dashboard' />
  </div>
</template>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 16px }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px }
@media (max-width: 960px) {
  .grid { grid-template-columns: 1fr }
}
</style>


