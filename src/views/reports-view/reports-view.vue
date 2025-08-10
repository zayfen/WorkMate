<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ReportGenerator from '@/components/report-generator/report-generator.vue'
import ReportPreview from '@/components/report-preview/report-preview.vue'
import ExportButtons from '@/components/export-buttons/export-buttons.vue'
import type { ReportData, ReportQuery } from '@/utils/report-types'
import { generateReport } from '@/utils/report-generator'
import { toMarkdown, toHtml, toPdfReadyHtml } from '@/utils/report-formatter'

const data = ref<ReportData | null>(null)
const previewRef = ref<InstanceType<typeof ReportPreview> | null>(null)
const projectsMap = ref<Record<number, string>>({})
const autoTitle = computed(() => {
  const d = data.value
  if (!d) return ''
  const g = d.query.granularity
  if (g === 'week') return `周报 | ${d.buckets[0]?.label || ''}`
  if (g === 'day') return `日报 | ${d.buckets[0]?.label || ''}`
  if (g === 'month') return `月报 | ${d.buckets[0]?.label || ''}`
  if (g === 'half-year') return `半年报 | ${d.buckets[0]?.label || ''}`
  return `年报 | ${d.buckets[0]?.label || ''}`
})

async function handleGenerate(payload: { granularity: ReportQuery['granularity']; from: number; to: number }) {
  const tasks = await window.api?.listTasks?.({ includeDone: true })
  const query: ReportQuery = { granularity: payload.granularity, from: payload.from, to: payload.to, title: undefined }
  const report = generateReport({ query, tasks: (tasks ?? []) })
  data.value = report
}

async function exportHtml() {
  if (!data.value) return
  // 优先使用组件提供的 HTML（含图表截图与样式），回退到原 Markdown->HTML
  const html = previewRef.value?.getExportHtml?.() ?? toHtml(data.value)
  await window.api?.saveReportText?.(html, 'report.html', [{ name: 'HTML', extensions: ['html'] }])
}
async function exportMd() {
  if (!data.value) return
  const md = toMarkdown(data.value)
  await window.api?.saveReportText?.(md, 'report.md', [{ name: 'Markdown', extensions: ['md'] }])
}
async function exportPdf() {
  if (!data.value) return
  const html = previewRef.value?.getExportHtml?.() ?? toPdfReadyHtml(data.value)
  await window.api?.saveReportPdf?.(html, 'report.pdf')
}

onMounted(async () => {
  const projects = await window.api?.listProjects?.(false)
  const map: Record<number, string> = {}
  for (const p of projects || []) map[p.id] = p.title
  projectsMap.value = map
})
</script>

<template>
  <div class="reports">
    <ReportGenerator @generate="handleGenerate" />
    <ReportPreview ref="previewRef" :data="data" :projectsMap="projectsMap">
      <template #title-right>
        <div class="actions">
          <ExportButtons @export-html="exportHtml" @export-md="exportMd" @export-pdf="exportPdf" />
        </div>
      </template>
      <template #title>{{ autoTitle }}</template>
    </ReportPreview>
  </div>
</template>

<style scoped>
.reports { display: flex; flex-direction: column; gap: 12px }
.actions :deep(.btn) { padding: 6px 10px; border-radius: 8px; font-size: 12px }
</style>


