import type { ReportData, ReportQuery, RendererTask } from './report-types'
import { splitIntoBuckets } from './date-range'

export interface GenerateReportInput {
  query: ReportQuery
  tasks: RendererTask[]
}

export function generateReport({ query, tasks }: GenerateReportInput): ReportData {
  const buckets = splitIntoBuckets(normalizeGranularity(query.granularity), query.from, query.to)
  const bucketed = buckets.map((b) => {
    const inRange = tasks.filter((t) => {
      const d = t.due_date ?? t.updated_at ?? t.created_at
      return d >= b.start && d <= b.end
    })
    const counts = countByStatus(inRange)
    return { label: b.label, start: b.start, end: b.end, tasks: inRange, counts }
  })

  const summaryCounts = countByStatus(tasks.filter((t) => (t.due_date ?? t.updated_at ?? t.created_at) >= query.from && (t.due_date ?? t.updated_at ?? t.created_at) <= query.to))
  const priorities = countByPriority(tasks)
  const overdue = tasks.filter((t) => t.status !== 'done' && (t.due_date ?? Infinity) < Date.now()).length

  const sections = {
    highlights: pickHighlights(tasks),
    inProgress: tasks.filter((t) => t.status === 'in_progress'),
    planned: tasks.filter((t) => t.status === 'todo'),
    risks: pickRisks(tasks),
    overdue: tasks.filter((t) => t.status !== 'done' && (t.due_date ?? Infinity) < Date.now())
  }

  return {
    query: autoTitleForQuery(query, buckets[0]?.label),
    generatedAt: Date.now(),
    summary: {
      ...summaryCounts,
      completionRate: summaryCounts.total === 0 ? 0 : summaryCounts.done / summaryCounts.total,
      priorities,
      overdue
    },
    buckets: bucketed,
    sections
  }
}

function normalizeGranularity(g: ReportQuery['granularity']): 'day' | 'week' | 'month' | 'half-year' | 'year' { return g }

function countByStatus(list: RendererTask[]) {
  let total = 0, done = 0, in_progress = 0, todo = 0
  for (const t of list) {
    total++
    if (t.status === 'done') done++
    else if (t.status === 'in_progress') in_progress++
    else todo++
  }
  return { total, done, in_progress, todo }
}

function countByPriority(list: RendererTask[]) {
  let low = 0, medium = 0, high = 0
  for (const t of list) {
    if (t.priority === 'low') low++
    else if (t.priority === 'high') high++
    else medium++
  }
  return { low, medium, high }
}

function pickHighlights(list: RendererTask[]): RendererTask[] {
  const topDone = list.filter((t) => t.status === 'done').sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0)).slice(0, 5)
  const topProgress = list.filter((t) => t.status === 'in_progress').slice(0, 3)
  return [...topDone, ...topProgress]
}

function pickRisks(list: RendererTask[]): RendererTask[] {
  const now = Date.now()
  return list.filter((t) => t.status !== 'done' && (t.due_date ?? now + 1) < now).slice(0, 10)
}

function autoTitleForQuery(q: ReportQuery, firstLabel?: string): ReportQuery {
  const label = firstLabel || ''
  const title = q.granularity === 'week' ? `周报 | ${label}`
    : q.granularity === 'day' ? `日报 | ${label}`
    : q.granularity === 'month' ? `月报 | ${label}`
    : q.granularity === 'half-year' ? `半年报 | ${label}`
    : `年报 | ${label}`
  return { ...q, title }
}


