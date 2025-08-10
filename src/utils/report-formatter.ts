import type { ReportData, RendererTask } from './report-types'

export function toMarkdown(data: ReportData): string {
  const lines: string[] = []
  lines.push(`# 周报 | ${data.query.title ?? data.query.granularity} (${fmtDate(new Date(data.query.from))} — ${fmtDate(new Date(data.query.to))})`)
  lines.push('')
  lines.push(`生成时间：${fmtDateTime(new Date(data.generatedAt))}`)
  lines.push('')
  lines.push(`- 任务总数：${data.summary.total}`)
  lines.push(`- 已完成：${data.summary.done}`)
  lines.push(`- 进行中：${data.summary.in_progress}`)
  lines.push(`- 待处理：${data.summary.todo}`)
  lines.push(`- 完成率：${(data.summary.completionRate * 100).toFixed(1)}%`)
  lines.push(`- 逾期：${data.summary.overdue}`)
  lines.push('')
  lines.push('## 亮点 Highlights')
  lines.push(renderTaskList(data.sections.highlights))
  lines.push('')
  lines.push('## 进行中 In Progress')
  lines.push(renderTaskList(data.sections.inProgress))
  lines.push('')
  lines.push('## 计划 Planned')
  lines.push(renderTaskList(data.sections.planned))
  lines.push('')
  lines.push('## 风险与阻塞 Risks')
  lines.push(renderTaskList(data.sections.risks))
  lines.push('')
  lines.push('## 逾期 Overdue')
  lines.push(renderTaskList(data.sections.overdue))
  lines.push('')
  lines.push('## 分桶数据 Buckets')
  for (const b of data.buckets) {
    lines.push(`### ${b.label}`)
    lines.push(renderTaskList(b.tasks))
    lines.push('')
  }
  return lines.join('\n')
}

export function toHtml(data: ReportData): string {
  const md = toMarkdown(data)
  // simple markdown to HTML (subset) to avoid large deps
  const html = md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Report</title>
  <style>
  :root{--fg:#111827;--muted:#6b7280;--border:#e5e7eb;--bg:#ffffff;--chip:#f3f4f6;--primary:#111827}
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; padding:24px; color:var(--fg); background:var(--bg);}
  .container{max-width:880px;margin:0 auto}
  .card{border:1px solid var(--border);border-radius:12px;padding:16px}
  h1{font-size:22px;margin:0 0 8px;font-weight:800}
  h2{font-size:18px;margin:16px 0 8px;font-weight:700}
  h3{font-size:16px;margin:12px 0 6px;font-weight:600}
  p{margin:8px 0}
  ul{padding-left:18px;margin:8px 0}
  li{margin:4px 0}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
  .kpi{background:#f9fafb;border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center}
  .kpi .num{font-size:18px;font-weight:700}
  .muted{color:var(--muted)}
  .project{border:1px solid var(--border);border-radius:12px;padding:12px;margin-top:12px}
  .p-head{font-weight:600;margin-bottom:8px}
  .t-row{display:grid;grid-template-columns:3fr 1fr 1fr 1fr 1.5fr;gap:8px;align-items:center}
  .t-head{color:var(--muted)}
  .chip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;background:var(--chip)}
  .chip.done{background:#dcfce7;color:#166534}
  .chip.in_progress{background:#dbeafe;color:#1e3a8a}
  .chip.todo{background:#fef3c7;color:#92400e}
  .chip.high{background:#fee2e2;color:#991b1b}
  .chip.medium{background:#e5e7eb;color:#374151}
  .chip.low{background:#e0f2fe;color:#075985}
  .progress{position:relative;height:8px;background:#f3f4f6;border-radius:999px}
  .bar{position:absolute;left:0;top:0;bottom:0;background:#3b82f6;border-radius:999px}
  @media print{body{padding:0}.card{border:none}}
  </style></head><body><div class="container"><div class="card"><p>${html}</p></div></div></body></html>`
}

export function toPdfReadyHtml(data: ReportData): string {
  // currently same as HTML. In Electron we can printToPDF or external tool later
  return toHtml(data)
}

function renderTaskList(tasks: RendererTask[]): string {
  if (!tasks.length) return '_无_'
  return tasks.map((t) => `- [${symbolForStatus(t.status)}] ${escapeMd(t.title)}${t.project_id ? ` (P${t.project_id})` : ''}${t.due_date ? ` · 截止 ${fmtDate(new Date(t.due_date))}` : ''}`).join('\n')
}

function escapeMd(s: string): string {
  return s.replace(/[\\*_[\]`]/g, (m) => `\\${m}`)
}

function symbolForStatus(s: RendererTask['status']): string {
  return s === 'done' ? '✓' : (s === 'in_progress' ? '…' : ' ')
}

function pad(n: number): string { return n < 10 ? `0${n}` : String(n) }
function fmtDate(d: Date): string { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function fmtDateTime(d: Date): string { return `${fmtDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}` }


