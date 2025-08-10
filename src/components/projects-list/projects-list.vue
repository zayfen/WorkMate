<script setup lang='ts'>
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'vue-toastification'

type ProjectCounts = { total: number, done: number, in_progress: number, todo: number }
type ProjectItem = {
  id: number
  title: string
  description: string | null
  created_at: number
  archived: boolean
  estimated_end_at: number | null
  participants: string[]
  counts: ProjectCounts
}

const toast = useToast()

const projects = ref<ProjectItem[]>([])
const loading = ref(false)
const showArchived = ref(false)

// modal state
const isModalOpen = ref(false)
const editing = ref<ProjectItem | null>(null)
const form = reactive({
  title: '',
  description: '',
  estimated_end_date: '' as string, // yyyy-mm-dd
  participants_text: ''
})

const filtered = computed(() => projects.value)

function formatDate(ts?: number | null): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function calcPercent(item: ProjectItem): number {
  const total = item.counts?.total ?? (item.counts.todo + item.counts.in_progress + item.counts.done)
  if (!total) return 0
  const percent = Math.round((item.counts.done / total) * 100)
  return Math.max(0, Math.min(100, percent))
}

function renderDescription(html: string): string {
  return sanitizeRichText(html)
}

function sanitizeRichText(html: string): string {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const allowedTags = new Set(['b','strong','i','em','u','a','p','ul','ol','li','br','span','div','code','pre','blockquote','h1','h2','h3','h4','h5','h6'])
    const allowedAttrs = new Set(['href','title'])

    const walk = (node: Node) => {
      // Remove script/style nodes entirely
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        const tag = el.tagName.toLowerCase()
        if (tag === 'script' || tag === 'style' || tag === 'iframe' || tag === 'object' || tag === 'embed') {
          el.remove()
          return
        }
        if (!allowedTags.has(tag)) {
          // unwrap unknown tag but keep its children
          const parent = el.parentNode
          if (parent) {
            while (el.firstChild) parent.insertBefore(el.firstChild, el)
            el.remove()
            return
          }
        } else {
          // scrub attributes
          for (const attr of Array.from(el.attributes)) {
            const name = attr.name.toLowerCase()
            if (!allowedAttrs.has(name)) {
              el.removeAttribute(attr.name)
              continue
            }
            if (name === 'href') {
              const value = (attr.value || '').trim()
              const lowered = value.toLowerCase()
              if (lowered.startsWith('javascript:')) {
                el.removeAttribute('href')
              }
            }
          }
        }
      }
      for (const child of Array.from(node.childNodes)) walk(child)
    }
    walk(doc.body)
    return doc.body.innerHTML.trim()
  } catch {
    return ''
  }
}

async function fetchProjects() {
  loading.value = true
  try {
    const list = await window.api?.listProjects?.(showArchived.value)
    projects.value = Array.isArray(list) ? list : []
  } catch (e) {
    toast.error('加载项目失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.title = ''
  form.description = ''
  form.estimated_end_date = ''
  form.participants_text = ''
  isModalOpen.value = true
}

function openEdit(item: ProjectItem) {
  editing.value = item
  form.title = item.title
  form.description = item.description ?? ''
  form.estimated_end_date = item.estimated_end_at ? formatDate(item.estimated_end_at) : ''
  form.participants_text = item.participants.join(', ')
  isModalOpen.value = true
}

function parseParticipants(text: string): string[] {
  return text
    .split(/[,\n]/g)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 50)
}

function parseEstimatedDate(dateStr: string): number | null {
  if (!dateStr) return null
  const t = new Date(dateStr).getTime()
  return Number.isFinite(t) ? t : null
}

async function submitForm() {
  const payload = {
    title: form.title.trim() || '未命名项目',
    description: form.description.trim() || null,
    estimated_end_at: parseEstimatedDate(form.estimated_end_date),
    participants: parseParticipants(form.participants_text)
  }

  try {
    if (editing.value) {
      const ok = await window.api?.updateProject?.({ id: editing.value.id, ...payload })
      if (!ok) throw new Error('update failed')
      toast.success('已更新项目')
    } else {
      const created = await window.api?.createProject?.(payload)
      if (!created) throw new Error('create failed')
      toast.success('已创建项目')
    }
    isModalOpen.value = false
    await fetchProjects()
  } catch (e) {
    toast.error('保存失败')
  }
}

async function removeProject(item: ProjectItem) {
  if (!confirm(`确定删除项目「${item.title}」？此操作不可恢复`)) return
  try {
    const ok = await window.api?.deleteProject?.(item.id)
    if (!ok) throw new Error('delete failed')
    toast.success('已删除')
    await fetchProjects()
  } catch {
    toast.error('删除失败')
  }
}

async function toggleArchive(item: ProjectItem) {
  try {
    const ok = await window.api?.setProjectArchived?.(item.id, !item.archived)
    if (!ok) throw new Error('archive failed')
    toast.success(item.archived ? '已恢复项目' : '已归档项目')
    await fetchProjects()
  } catch {
    toast.error('操作失败')
  }
}

async function toggleShowArchived() {
  showArchived.value = !showArchived.value
  await fetchProjects()
}

onMounted(fetchProjects)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div class="text-lg font-semibold">项目列表</div>
      <div class="flex items-center gap-2">
        <button type="button" @click="toggleShowArchived" class="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
          <span v-if="showArchived">隐藏归档</span>
          <span v-else>显示归档</span>
        </button>
        <button type="button" @click="openCreate" class="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
          新建项目
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">加载中...</div>
    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="p in filtered" :key="p.id" class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="truncate text-base font-semibold" :title="p.title">{{ p.title }}</div>
              <span class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">{{ calcPercent(p) }}% 完成</span>
            </div>
            <div v-if="p.description" class="mt-1 break-words text-xs text-gray-600" v-html="renderDescription(p.description)"></div>
          </div>
          <span v-if="p.archived" class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">已归档</span>
        </div>

        <div class="mt-3 space-y-1 text-xs text-gray-600">
          <div>创建时间：<span class="text-gray-900">{{ formatDate(p.created_at) }}</span></div>
          <div>预计结束：<span class="text-gray-900">{{ formatDate(p.estimated_end_at) }}</span></div>
          <div>参与人：
            <span v-if="p.participants.length === 0" class="text-gray-400">-</span>
            <span v-else class="inline-flex flex-wrap gap-1">
              <span v-for="name in p.participants" :key="name" class="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">{{ name }}</span>
            </span>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
          <span class="rounded-md bg-amber-100 px-2 py-0.5 text-amber-700">未开始 {{ p.counts.todo }}</span>
          <span class="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700">进行中 {{ p.counts.in_progress }}</span>
          <span class="rounded-md bg-green-100 px-2 py-0.5 text-green-700">完成 {{ p.counts.done }}</span>
        </div>

        <div class="mt-4 flex items-center gap-2">
          <button type="button" @click="openEdit(p)" class="text-sm text-blue-600 hover:underline">编辑</button>
          <button type="button" @click="removeProject(p)" class="text-sm text-rose-600 hover:underline">删除</button>
          <button type="button" @click="toggleArchive(p)" class="ml-auto text-sm text-gray-600 hover:underline">
            {{ p.archived ? '恢复' : '归档' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <div class="text-base font-semibold">{{ editing ? '编辑项目' : '新建项目' }}</div>
        <div class="mt-3 space-y-3">
          <div>
            <label class="block text-xs text-gray-600">标题</label>
            <input v-model="form.title" type="text" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" placeholder="请输入项目标题" />
          </div>
          <div>
            <label class="block text-xs text-gray-600">描述</label>
            <textarea v-model="form.description" rows="3" class="mt-1 w-full resize-y rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" placeholder="可选"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600">预计结束日期</label>
              <input v-model="form.estimated_end_date" type="date" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" />
            </div>
            <div>
              <label class="block text-xs text-gray-600">参与人（用逗号分隔）</label>
              <input v-model="form.participants_text" type="text" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none" placeholder="例如：王伟, 李娜" />
            </div>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-end gap-2">
          <button type="button" @click="isModalOpen=false" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">取消</button>
          <button type="button" @click="submitForm" class="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>


