<script setup lang='ts'>
import { reactive, watch, computed } from 'vue'
import { useToast } from 'vue-toastification'

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

const props = defineProps<{
  open: boolean
  task: TaskItem | null
  projects: Array<{ id: number, title: string }>
}>()
const emit = defineEmits<{ close: []; saved: []; deleted: [] }>()
const toast = useToast()

const form = reactive({
  title: '',
  description: '',
  project_id: 0 as number,
  participants_text: '',
  due_date: '' as string, // yyyy-mm-dd
  priority: 'medium' as TaskPriority,
  status: 'todo' as TaskStatus,
  note: ''
})

const isEdit = computed(() => Boolean(props.task))

function formatDate(ts?: number | null): string {
  if (!ts) return ''
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDate(dateStr: string): number | null {
  if (!dateStr) return null
  const t = new Date(dateStr).getTime()
  return Number.isFinite(t) ? t : null
}

function parseParticipants(text: string): string[] {
  return text.split(/[\n,]/g).map(s => s.trim()).filter(Boolean).slice(0, 50)
}

watch(() => props.task, (t) => {
  if (t) {
    form.title = t.title
    form.description = t.description ?? ''
    form.project_id = t.project_id
    form.participants_text = (t.participants || []).join(', ')
    form.due_date = formatDate(t.due_date)
    form.priority = t.priority
    form.status = t.status
    form.note = t.note ?? ''
  } else {
    form.title = ''
    form.description = ''
    form.project_id = props.projects[0]?.id || 0
    form.participants_text = ''
    form.due_date = ''
    form.priority = 'medium'
    form.status = 'todo'
    form.note = ''
  }
}, { immediate: true })

async function handleSave() {
  if (!props.projects?.length) {
    toast.error('请先创建项目后再添加任务')
    return
  }
  if (!form.project_id) {
    toast.error('请选择项目')
    return
  }
  if (!form.title.trim()) {
    toast.error('请输入任务标题')
    return
  }
  const payload = {
    project_id: form.project_id,
    title: form.title.trim() || '未命名任务',
    description: form.description.trim() || null,
    participants: parseParticipants(form.participants_text),
    due_date: parseDate(form.due_date),
    priority: form.priority,
    status: form.status,
    note: form.note.trim() || null
  }
  if (props.task) {
    if (typeof window.api?.updateTask !== 'function') { toast.error('任务 API 未加载'); return }
    const ok = await window.api.updateTask({ id: props.task.id, ...payload })
    if (!ok) { toast.error('保存失败'); return }
    toast.success('已更新任务')
  } else {
    if (typeof window.api?.createTask !== 'function') { toast.error('任务 API 未加载'); return }
    const created = await window.api.createTask(payload)
    if (!created) { toast.error('保存失败'); return }
    toast.success('已创建任务')
  }
  emit('saved')
}

async function handleDelete() {
  if (!props.task) return
  if (typeof window.api?.deleteTask !== 'function') { toast.error('任务 API 未加载'); return }
  const ok = await window.api.deleteTask(props.task.id)
  if (!ok) { toast.error('删除失败'); return }
  toast.success('已删除任务')
  emit('deleted')
}
</script>

<template>
  <teleport to='body'>
    <div v-if='props.open' class='mask' @click.self="emit('close')">
      <div class='modal'>
        <header class='head'>
          <h3>{{ isEdit ? '编辑任务' : '新建任务' }}</h3>
          <button class='link' @click="emit('close')">取消</button>
        </header>
        <section class='body'>
          <div class='form'>
            <label>标题</label>
            <input v-model='form.title' placeholder='任务标题' />
            <label>描述</label>
            <textarea v-model='form.description' rows='3' placeholder='任务描述' />
            <label>项目</label>
            <select v-model='form.project_id'>
              <option v-for='p in props.projects' :key='p.id' :value='p.id'>{{ p.title }}</option>
            </select>
            <label>参与人（用逗号分隔）</label>
            <input v-model='form.participants_text' placeholder='例如：张伟, 李娜' />
            <label>截止日期</label>
            <input v-model='form.due_date' type='date' />
            <label>优先级</label>
            <select v-model='form.priority'>
              <option value='high'>高</option>
              <option value='medium'>中</option>
              <option value='low'>低</option>
            </select>
            <label>任务状态</label>
            <select v-model='form.status'>
              <option value='todo'>未开始</option>
              <option value='in_progress'>进行中</option>
              <option value='done'>已完成</option>
            </select>
            <label>备注</label>
            <textarea v-model='form.note' rows='2' placeholder='可选'></textarea>
          </div>
        </section>
        <footer class='foot'>
          <div class='left'>
            <button v-if='isEdit' class='danger' @click='handleDelete'>删除</button>
          </div>
          <div class='right'>
            <button class='link' @click="emit('close')">取消</button>
            <button class='primary' @click='handleSave'>保存</button>
          </div>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(0,0,0,0.2); display: grid; place-items: center }
.modal { width: 720px; max-width: calc(100vw - 32px); background: rgba(255,255,255,0.7); backdrop-filter: saturate(180%) blur(20px); border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden }
.head, .foot { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff }
.body { padding: 12px 16px; max-height: 60vh; overflow: auto }
.form { display: grid; grid-template-columns: 1fr; gap: 8px }
input, textarea, select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff }
.primary { background: #111827; color: #fff; border: none; padding: 8px 12px; border-radius: 10px }
.danger { background: #fee2e2; color: #991b1b; border: none; padding: 8px 12px; border-radius: 10px }
.link { background: transparent; border: none; color: #2563eb; cursor: pointer }
.left, .right { display: flex; align-items: center; gap: 8px }
</style>


