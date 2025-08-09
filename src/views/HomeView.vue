<script setup lang="ts">
import { useRouter } from 'vue-router'

type FeatureEntry = {
  key: string
  title: string
  description: string
  icon: string
  to?: string
  disabled?: boolean
}

const router = useRouter()

const features: FeatureEntry[] = [
  { key: 'user', title: '用户与鉴权', description: '本地用户资料与设备标识', icon: '👤', disabled: true },
  { key: 'data', title: '数据模型与持久化', description: '本地数据库与 DAO 层', icon: '🗄️', disabled: true },
  { key: 'tasks', title: '任务与工程管理', description: '任务/项目 CRUD 与流程', icon: '✅', disabled: true },
  { key: 'views', title: '视图模块（天/周/月/年）', description: '多维度日历与统计', icon: '📅', disabled: true },
  { key: 'reporting', title: '报告与导出', description: 'HTML/Markdown/PDF 报表', icon: '📊', disabled: true },
  { key: 'notifications', title: '通知模块', description: '调度、本地与系统通知', icon: '🔔', disabled: true },
  { key: 'lan', title: '局域网协作', description: '发现、广播与同步', icon: '📡', disabled: true },
  { key: 'messaging', title: '消息收发与回复', description: '协议、入库与回复', icon: '💬', disabled: true },
  { key: 'quality', title: '测试与发布', description: '自动化测试与打包', icon: '🧪', disabled: true },
  { key: 'docs', title: '文档与运维', description: '用户手册与日志', icon: '📚', disabled: true },
  { key: 'about', title: '关于', description: '了解更多项目信息', icon: 'ℹ️', to: '/about' }
]

function open(entry: FeatureEntry) {
  if (entry.to) {
    router.push(entry.to)
    return
  }
}
</script>

<template>
  <section class="hero">
    <h1>WorkMate</h1>
    <p class="tagline">Vue 3 + TypeScript + Vite + Router + Electron + Vitest</p>
  </section>

  <section class="grid">
    <div
      v-for="entry in features"
      :key="entry.key"
      class="card"
      :class="{ disabled: !!entry.disabled && !entry.to }"
      role="button"
      tabindex="0"
      @click="open(entry)"
      @keydown.enter.prevent="open(entry)"
      @keydown.space.prevent="open(entry)"
    >
      <div class="card-header">
        <span class="icon">{{ entry.icon }}</span>
        <h3 class="title">{{ entry.title }}</h3>
      </div>
      <p class="desc">{{ entry.description }}</p>
      <div class="actions">
        <RouterLink v-if="entry.to" class="action" :to="entry.to">进入</RouterLink>
        <span v-else class="action muted" aria-disabled="true">即将上线</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}
.hero h1 {
  margin: 0 0 8px 0;
}
.hero .tagline {
  margin: 0;
  color: #6b7280;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.card {
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 14px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  background: transparent;
}
.card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}
.card.disabled {
  opacity: 0.75;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.icon {
  font-size: 20px;
}
.title {
  font-size: 16px;
  margin: 0;
}
.desc {
  color: #6b7280;
  margin: 0 0 10px 0;
}
.actions {
  display: flex;
  align-items: center;
}
.action {
  font-size: 13px;
}
.action.muted {
  color: #9ca3af;
}
</style>


