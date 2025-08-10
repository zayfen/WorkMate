<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

type NavItem = { label: string, path: string, icon: string }

const route = useRoute()

const items = computed<NavItem[]>(() => [
  { label: '仪表盘', path: '/app/dashboard', icon: '🏠' },
  { label: '日程', path: '/app/calendar', icon: '📅' },
  { label: '项目', path: '/app/projects', icon: '📁' },
  { label: '任务', path: '/app/tasks', icon: '✅' },
  { label: '报告', path: '/app/reports', icon: '📊' },
  { label: '消息', path: '/app/messages', icon: '💬' },
  { label: '设置', path: '/app/settings', icon: '⚙️' }
])

const isActive = (path: string) => route.path.startsWith(path)
</script>

<template>
  <nav class="sidebar-nav">
    <ul class="nav-list">
      <li v-for="item in items" :key="item.path">
        <RouterLink :to="item.path" class="nav-link" :class="{ active: isActive(item.path) }">
          <span class="icon">{{ item.icon }}</span>
          <span class="label">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
    <div class="divider" />
    <div class="section-title">局域网成员</div>
  </nav>
</template>

<style scoped>
.sidebar-nav {
  padding: 12px 8px;
}
.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #111827;
  text-decoration: none;
  position: relative;
}
.nav-link.active {
  background: rgba(0, 122, 255, 0.1);
}
.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: #007aff;
  border-radius: 2px;
}
.icon { width: 20px; text-align: center }
.label { font-weight: 500 }
.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 10px 6px;
}
.section-title {
  font-size: 12px;
  color: #6b7280;
  padding: 0 8px;
}
</style>


