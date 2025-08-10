import { generateReport } from '@/utils/report-generator'
import type { ReportQuery, RendererTask } from '@/utils/report-types'

describe('report-generator', () => {
  const tasks: RendererTask[] = [
    { id: 1, project_id: 1, title: 'A', description: null, participants: [], due_date: Date.now() - 86400000, priority: 'high', status: 'done', note: null, created_at: Date.now() - 5*86400000, updated_at: null },
    { id: 2, project_id: 1, title: 'B', description: null, participants: [], due_date: Date.now() + 86400000, priority: 'medium', status: 'in_progress', note: null, created_at: Date.now() - 3*86400000, updated_at: null },
    { id: 3, project_id: 2, title: 'C', description: null, participants: [], due_date: null, priority: 'low', status: 'todo', note: null, created_at: Date.now() - 2*86400000, updated_at: null }
  ]

  it('generates summary and buckets', () => {
    const now = Date.now()
    const query: ReportQuery = { granularity: 'week', from: now - 7*86400000, to: now + 7*86400000 }
    const report = generateReport({ query, tasks })
    expect(report.summary.total).toBeGreaterThan(0)
    expect(report.buckets.length).toBeGreaterThan(0)
  })
})


