<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

type TaskStatus = 'todo' | 'in-progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

type Task = {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueAt?: string
  project?: string
  tags?: string[]
  createdAt: string
}

type ChatMessage = {
  id: number
  author: 'me' | 'bot'
  text: string
  at: string
}

// 顶部菜单状态
const userMenuOpen = ref(false)

// 任务数据（占位，后续由数据层接管）
const tasks = ref<Task[]>([
  { id: 1, title: '示例：创建你的第一个任务', status: 'in-progress', priority: 'medium', createdAt: new Date().toISOString() },
  { id: 2, title: '阅读 Epic 任务与规范', status: 'todo', priority: 'high', createdAt: new Date().toISOString() },
  { id: 3, title: '完善用户资料', status: 'todo', priority: 'low', createdAt: new Date().toISOString() }
])

const searchTerm = ref('')
const statusFilter = ref<'all' | TaskStatus>('all')

const filteredTasks = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  return tasks.value.filter((t) => {
    const byText = !term || t.title.toLowerCase().includes(term)
    const byStatus = statusFilter.value === 'all' || t.status === statusFilter.value
    return byText && byStatus
  })
})

const showNewTask = ref(false)
const newTaskTitle = ref('')
const newTaskPriority = ref<TaskPriority>('medium')
const newTaskDueAt = ref('')

function addTask(): void {
  const title = newTaskTitle.value.trim()
  if (!title) return
  const nextId = (tasks.value.at(-1)?.id ?? 0) + 1
  const task: Task = {
    id: nextId,
    title,
    status: 'todo',
    priority: newTaskPriority.value,
    dueAt: newTaskDueAt.value || undefined,
    createdAt: new Date().toISOString()
  }
  tasks.value = [task, ...tasks.value]
  newTaskTitle.value = ''
  newTaskPriority.value = 'medium'
  newTaskDueAt.value = ''
  showNewTask.value = false
}

function toggleTaskStatus(task: Task): void {
  const next: Record<TaskStatus, TaskStatus> = {
    todo: 'done',
    'in-progress': 'done',
    done: 'todo'
  }
  task.status = next[task.status]
}

function deleteTask(taskId: number): void {
  tasks.value = tasks.value.filter((t) => t.id !== taskId)
}

// 聊天面板
const chatOpen = ref(false)
const chatMessages = ref<ChatMessage[]>([
  { id: 1, author: 'bot', text: '欢迎使用 WorkMate！这是消息面板，你可以在这里与同伴交流。', at: new Date().toISOString() }
])
const chatInput = ref('')
const chatBodyEl = ref<HTMLDivElement | null>(null)

function sendMessage(): void {
  const text = chatInput.value.trim()
  if (!text) return
  const nextId = (chatMessages.value.at(-1)?.id ?? 0) + 1
  chatMessages.value.push({ id: nextId, author: 'me', text, at: new Date().toISOString() })
  chatInput.value = ''
  nextTick(() => scrollChatToBottom())
}

function scrollChatToBottom(): void {
  const el = chatBodyEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

onMounted(() => nextTick(scrollChatToBottom))
</script>

<template>
  <!-- 顶部菜单栏 -->
  <header class="menubar">
    <div class="brand">
      <h1 class="brand-title">WorkMate</h1>
      <small class="brand-tag">Vue 3 + TypeScript + Vite + Router + Electron + Vitest</small>
    </div>
    <div class="menu-actions">
      <button class="btn ghost" @click="chatOpen = !chatOpen">{{ chatOpen ? '收起消息' : '消息' }}</button>
      <div class="user" @click="userMenuOpen = !userMenuOpen" tabindex="0">
        <div class="avatar" aria-label="User menu">R</div>
        <div v-if="userMenuOpen" class="dropdown" @click.stop>
          <div class="item disabled" aria-disabled="true">个人资料（即将上线）</div>
          <div class="item disabled" aria-disabled="true">设置（即将上线）</div>
          <RouterLink class="item" to="/about">关于</RouterLink>
        </div>
      </div>
    </div>
  </header>

  <!-- 主体：任务管理模块 -->
  <main class="layout">
    <section class="tasks">
      <div class="toolbar">
        <input
          v-model="searchTerm"
          type="text"
          class="input"
          placeholder="搜索任务..."
        />
        <select v-model="statusFilter" class="select">
          <option value="all">全部状态</option>
          <option value="todo">待办</option>
          <option value="in-progress">进行中</option>
          <option value="done">已完成</option>
        </select>
        <button class="btn primary" @click="showNewTask = !showNewTask">{{ showNewTask ? '取消' : '新建任务' }}</button>
        <span class="count">共 {{ filteredTasks.length }} 项</span>
      </div>

      <div v-if="showNewTask" class="new-task">
        <input v-model="newTaskTitle" class="input grow" type="text" placeholder="任务标题（必填）" />
        <select v-model="newTaskPriority" class="select">
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
        <input v-model="newTaskDueAt" class="input" type="date" />
        <button class="btn primary" @click="addTask">保存</button>
      </div>

      <ul class="task-list">
        <li v-for="task in filteredTasks" :key="task.id" class="task-item">
          <div class="left">
            <span class="badge" :class="task.status">{{ task.status === 'todo' ? '待办' : task.status === 'in-progress' ? '进行中' : '已完成' }}</span>
            <span class="title">{{ task.title }}</span>
          </div>
          <div class="right">
            <span class="meta" :class="task.priority">{{ task.priority }}</span>
            <button class="btn ghost" @click="toggleTaskStatus(task)">{{ task.status === 'done' ? '重开' : '完成' }}</button>
            <button class="btn ghost danger" @click="deleteTask(task.id)">删除</button>
          </div>
        </li>
      </ul>
    </section>
  </main>

  <!-- 右侧聊天抽屉 -->
  <aside class="chat" :class="{ open: chatOpen }" aria-label="消息面板">
    <div class="chat-header">
      <h3>消息</h3>
      <button class="btn ghost" @click="chatOpen = false">×</button>
    </div>
    <div class="chat-body" ref="chatBodyEl">
      <div v-for="m in chatMessages" :key="m.id" class="msg" :class="m.author">
        <div class="bubble">{{ m.text }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="chatInput" class="input grow" type="text" placeholder="输入消息并回车发送" @keydown.enter.prevent="sendMessage" />
      <button class="btn primary" @click="sendMessage">发送</button>
    </div>
  </aside>

  <!-- 浮动消息开关（移动端/小屏友好） -->
  <button class="fab" @click="chatOpen = !chatOpen">💬</button>
</template>

<style scoped>
/* 顶部菜单栏 */
.menubar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--c-border);
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.brand-title {
  margin: 0;
}
.brand-tag {
  color: #6b7280;
}
.menu-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #111827;
  display: grid;
  place-items: center;
  font-weight: 600;
}
.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 160px;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  z-index: 10;
}
.dropdown .item {
  padding: 10px 12px;
  display: block;
  color: #111827;
}
.dropdown .item:hover { background: #f3f4f6; }
.dropdown .item.disabled { color: #9ca3af; pointer-events: none; }

/* 主布局 */
.layout {
  padding: 16px;
}
.tasks {
  max-width: 980px;
  margin: 0 auto;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.count { color: #6b7280; }
.new-task {
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 12px;
}
.task-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
}
.task-item .left { display: flex; align-items: center; gap: 10px; }
.task-item .right { display: flex; align-items: center; gap: 8px; }
.task-item .title { font-weight: 600; }
.meta { color: #6b7280; }
.meta.high { color: #ef4444; }
.meta.medium { color: #f59e0b; }
.meta.low { color: #10b981; }

.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--c-border);
}
.badge.todo { background: #fff; }
.badge.in-progress { background: #e0f2fe; }
.badge.done { background: #dcfce7; }

/* 控件 */
.btn {
  border: 1px solid var(--c-border);
  background: #fff;
  border-radius: 10px;
  padding: 6px 12px;
  cursor: pointer;
}
.btn:hover { background: #f9fafb; }
.btn.primary { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.btn.primary:hover { background: #2563eb; border-color: #2563eb; }
.btn.ghost { background: transparent; }
.btn.danger { color: #ef4444; }

.input, .select {
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 6px 10px;
  outline: none;
}
.input:focus, .select:focus { box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
.grow { flex: 1 1 auto; }

/* 聊天抽屉 */
.chat {
  position: fixed;
  top: 0;
  right: 0;
  width: min(380px, 92vw);
  height: 100vh;
  background: #fff;
  border-left: 1px solid var(--c-border);
  transform: translateX(100%);
  transition: transform 0.2s ease;
  display: flex;
  flex-direction: column;
  z-index: 20;
}
.chat.open { transform: translateX(0); }
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid var(--c-border);
}
.chat-body {
  flex: 1 1 auto;
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.msg { display: flex; }
.msg.me { justify-content: flex-end; }
.bubble {
  max-width: 70%;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 8px 10px;
}
.msg.me .bubble { background: #dbeafe; border-color: #bfdbfe; }
.msg.bot .bubble { background: #f3f4f6; }
.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--c-border);
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--c-border);
  background: #fff;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  cursor: pointer;
}
.fab:hover { background: #f9fafb; }
</style>


