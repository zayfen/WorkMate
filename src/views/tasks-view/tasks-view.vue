<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import FilterBar from '@/components/filter-bar/filter-bar.vue'
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
  progress: number
  created_at: number
  updated_at: number | null
}

type ProjectItem = { id: number, title: string }

const toast = useToast()

const tasks = ref<TaskItem[]>([])
const loading = ref(false)
const projects = ref<ProjectItem[]>([])
const projectsMap = computed(() => Object.fromEntries(projects.value.map(p => [p.id, p.title])))

// filter state
const status = ref<'all' | TaskStatus>('all')
const priority = ref<'all' | TaskPriority>('all')
const projectId = ref<number | 'all'>('all')
const due = ref<'today' | 'this_week' | 'this_month' | 'all'>('today')
const includeDone = ref(false)

// editor state
const isEditorOpen = ref(false)
const editingTask = ref<TaskItem | null>(null)

async function fetchProjects() {
  try {
    const list = await window.api?.listProjects?.(false)
    projects.value = Array.isArray(list) ? list.map(p => ({ id: p.id, title: p.title })) : []
  } catch {
    projects.value = []
  }
}

function buildTaskFilters() {
  return {
    statuses: status.value === 'all' ? undefined : [status.value],
    priorities: priority.value === 'all' ? undefined : [priority.value],
    projectIds: projectId.value === 'all' ? undefined : [Number(projectId.value)],
    due: due.value,
    includeDone: includeDone.value
  }
}

async function fetchTasks() {
  loading.value = true
  try {
    if (typeof window.api?.listTasks !== 'function') {
      toast.error('任务 API 未加载，请重启应用（或重新运行 yarn build:electron && yarn start）')
      tasks.value = []
      return
    }
    const list = await window.api.listTasks(buildTaskFilters())
    tasks.value = Array.isArray(list) ? list : []
  } catch {
    toast.error('加载任务失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingTask.value = null
  isEditorOpen.value = true
}

function openEdit(task: TaskItem) {
  editingTask.value = task
  isEditorOpen.value = true
}

async function removeTask(task: TaskItem) {
  if (!confirm(`确认删除任务「${task.title}」？此操作不可恢复`)) return
  try {
    const ok = await window.api?.deleteTask?.(task.id)
    if (!ok) throw new Error('delete failed')
    toast.success('已删除任务')
    await fetchTasks()
  } catch {
    toast.error('删除失败')
  }
}

async function updateTaskStatus(payload: { task: TaskItem; status: TaskStatus }) {
  try {
    if (typeof window.api?.updateTask !== 'function') { toast.error('任务 API 未加载'); return }
    const ok = await window.api.updateTask({ id: payload.task.id, status: payload.status })
    if (!ok) throw new Error('update failed')
    await fetchTasks()
  } catch {
    toast.error('更新状态失败')
  }
}

async function updateTaskPriority(payload: { task: TaskItem; priority: TaskPriority }) {
  try {
    if (typeof window.api?.updateTask !== 'function') { toast.error('任务 API 未加载'); return }
    const ok = await window.api.updateTask({ id: payload.task.id, priority: payload.priority })
    if (!ok) throw new Error('update failed')
    await fetchTasks()
  } catch {
    toast.error('更新优先级失败')
  }
}

async function onInlineProgress(payload: { task: TaskItem; progress: number }) {
  try {
    if (typeof window.api?.updateTask !== 'function') { toast.error('任务 API 未加载'); return }
    const ok = await window.api.updateTask({ id: payload.task.id, progress: payload.progress })
    if (!ok) throw new Error('update failed')
    await fetchTasks()
  } catch {
    toast.error('更新进度失败')
  }
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchTasks()])
})

watch([status, priority, projectId, due, includeDone], fetchTasks)
</script>

<template>
  <div class='flex flex-col gap-3'>
    <FilterBar
      :status='status'
      :priority='priority'
      :project-id='projectId'
      :projects='projects'
      :due='due'
      :include-done='includeDone'
      @update:status='status = $event'
      @update:priority='priority = $event'
      @update:project-id='projectId = $event'
      @update:due='due = $event'
      @update:include-done='includeDone = $event'
      @create-task='openCreate'
    />

    <div v-if='loading' class='text-sm text-gray-500'>加载中...</div>
    <TasksList
      v-else
      :tasks='tasks'
      :projects-map='projectsMap'
      @update-status='updateTaskStatus'
      @update-priority='updateTaskPriority'
      @update-progress='onInlineProgress'
      @edit='openEdit'
      @delete='removeTask'
    />

    <TaskEditorModal
      :open='isEditorOpen'
      :task='editingTask'
      :projects='projects'
      @close='isEditorOpen=false'
      @saved='() => { isEditorOpen=false; fetchTasks() }'
      @deleted='() => { isEditorOpen=false; fetchTasks() }'
    />
  </div>
</template>

<style scoped>
</style>


