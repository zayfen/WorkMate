<script setup lang="ts">
import { computed } from 'vue'
import type { ReportData, RendererTask } from '@/utils/report-types'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend)

const props = defineProps<{ data?: ReportData | null; projectsMap?: Record<number, string> }>()
const title = computed(() => props.data?.query.title ?? '周报预览')
const summary = computed(() => props.data?.summary ?? { total: 0, done: 0, in_progress: 0, todo: 0, completionRate: 0, priorities: { low: 0, medium: 0, high: 0 }, overdue: 0 })
const buckets = computed(() => props.data?.buckets ?? [])
// sections 仅用于统计逾期数量、后续如需展示更多分区可扩展
const sections = computed(() => props.data?.sections ?? { highlights: [], inProgress: [], planned: [], risks: [], overdue: [] })

const tasksInRange = computed<RendererTask[]>(() => {
  const list: RendererTask[] = []
  for (const b of buckets.value) list.push(...b.tasks)
  const seen = new Set<number>()
  return list.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
})

const byProject = computed(() => {
  const map = new Map<number, RendererTask[]>()
  for (const t of tasksInRange.value) {
    if (!map.has(t.project_id)) map.set(t.project_id, [])
    map.get(t.project_id)!.push(t)
  }
  const arr = Array.from(map.entries()).map(([pid, tasks]) => ({
    projectId: pid,
    projectName: props.projectsMap?.[pid] ?? `项目 ${pid}`,
    tasks
  }))
  arr.sort((a, b) => a.projectName.localeCompare(b.projectName))
  return arr
})

const chartData = computed((): { labels: string[]; datasets: Array<{ label: string; backgroundColor: string | string[]; data: number[]; borderRadius: number; borderSkipped: boolean }>} => {
  const labels = ['总数', '完成', '进行中', '未开始', '逾期']
  const s = summary.value
  const overdue = sections.value.overdue.length
  return {
    labels,
    datasets: [
      {
        label: '任务统计',
        backgroundColor: ['#111827', '#16a34a', '#2563eb', '#f59e0b', '#dc2626'],
        data: [s.total, s.done, s.in_progress, s.todo, overdue],
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
    y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { color: '#6b7280', font: { size: 11 }, precision: 0 } }
  }
}

const completionRateLabel = computed(() => `${(summary.value.completionRate * 100).toFixed(0)}%`)

function formatDate(ts?: number | null): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
</script>

<template>
  <div class="preview">
    <div class="head">
      <h2 class="title"><slot name="title">{{ title }}</slot></h2>
      <div class="right"><slot name="title-right" /></div>
    </div>

    <div class="chart-card">
      <div class="chart-head">
        <div class="chart-title">完成情况</div>
        <div class="chart-meta">完成率 {{ completionRateLabel }}</div>
      </div>
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div class="paper">
      <div class="sec">
        <div class="sec-title">项目明细</div>
        <div class="projects">
          <div class="project" v-for="p in byProject" :key="p.projectId">
            <div class="p-head">{{ p.projectName }}</div>
            <div class="table" role="table" aria-label="项目任务列表">
              <div class="t-row t-head" role="row">
                <div class="c-title" role="columnheader">标题</div>
                <div class="c-status" role="columnheader">状态</div>
                <div class="c-priority" role="columnheader">优先级</div>
                <div class="c-due" role="columnheader">截止日期</div>
                <div class="c-progress" role="columnheader">进度</div>
              </div>
              <div class="t-row" v-for="t in p.tasks" :key="t.id" role="row">
                <div class="c-title" role="cell">{{ t.title }}</div>
                <div class="c-status" role="cell">
                  <span class="chip" :class="t.status">{{ t.status === 'done' ? '已完成' : (t.status === 'in_progress' ? '进行中' : '未开始') }}</span>
                </div>
                <div class="c-priority" role="cell">
                  <span class="chip" :class="t.priority">{{ t.priority === 'high' ? '高' : (t.priority === 'low' ? '低' : '中') }}</span>
                </div>
                <div class="c-due" role="cell">{{ formatDate(t.due_date) }}</div>
                <div class="c-progress" role="cell">
                  <div class="progress"><div class="bar" :style="{ width: Math.max(0, Math.min(100, (t as any).progress ?? 0)) + '%' }"></div></div>
                  <div class="pct">{{ Math.max(0, Math.min(100, (t as any).progress ?? 0)) }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: grid; gap: 12px; grid-template-rows: auto auto auto 1fr; max-height: calc(100vh - 120px); overflow: auto }
.head { display: flex; align-items: center; justify-content: space-between }
.title { font-size: 20px; font-weight: 700 }
.summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px }
.col { background: rgba(0,0,0,0.03); border-radius: 12px; padding: 16px; text-align: center }
.num { font-weight: 700; font-size: 18px }
.label { color: #6b7280; font-size: 12px }
.chart-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px 16px; height: 220px; display: grid; grid-template-rows: auto 1fr }
.chart-head { display: flex; align-items: center; justify-content: space-between }
.chart-title { font-size: 14px; font-weight: 600; color: #374151 }
.chart-meta { font-size: 13px; color: #374151; font-weight: 500 }
.paper { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; min-height: 160px; display: grid; gap: 12px; overflow: auto }
.sec { display: grid; gap: 6px }
.sec-title { font-weight: 600; color: #374151 }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px }
.buckets { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px }
.bucket { border: 1px dashed #e5e7eb; border-radius: 10px; padding: 10px }
.projects { display: grid; gap: 12px }
.project { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.p-head { font-weight: 600; margin-bottom: 8px; font-size: 14px }
.table { display: grid; gap: 6px }
.t-row { display: grid; grid-template-columns: 3fr 1fr 1fr 1fr 1.5fr; align-items: center; gap: 8px }
.t-row.t-head { color: #6b7280; font-size: 12px }
.t-row:not(.t-head) { font-size: 13px; color: #111827 }
.c-title { line-height: 1.3 }
.c-progress { display: flex; align-items: center; gap: 6px }
.progress { position: relative; height: 6px; background: #eef2f7; border-radius: 999px; width: 100% }
.progress .bar { position: absolute; left: 0; top: 0; bottom: 0; background: #3b82f6; border-radius: 999px }
.chip { display: inline-block; padding: 1px 8px; border-radius: 999px; font-size: 11px; background: #f3f4f6 }
.chip.done { background: #dcfce7; color: #166534 }
.chip.in_progress { background: #dbeafe; color: #1e3a8a }
.chip.todo { background: #fef3c7; color: #92400e }
.chip.high { background: #fee2e2; color: #991b1b }
.chip.medium { background: #e5e7eb; color: #374151 }
.chip.low { background: #e0f2fe; color: #075985 }
</style>


