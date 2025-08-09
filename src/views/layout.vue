<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from '@/components/sidebar-nav/sidebar-nav.vue'
import LanMembersPanel from '@/components/lan-members-panel/lan-members-panel.vue'

const route = useRoute()
const title = computed(() => (route.meta?.title as string) || 'WorkMate')
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <SidebarNav />
      <div class="sidebar-footer">
        <LanMembersPanel />
      </div>
    </aside>
    <section class="main">
      <header class="main-header">
        <h1>{{ title }}</h1>
      </header>
      <div class="content">
        <RouterView />
      </div>
    </section>
  </div>
  
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  height: 100vh;
  background: #f2f2f7;
}
.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: saturate(180%) blur(20px);
  background: rgba(255, 255, 255, 0.75);
  border-right: 1px solid #e5e7eb;
}
.sidebar-footer {
  padding: 12px;
}
.main {
  display: flex;
  flex-direction: column;
}
.main-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}
.main-header h1 {
  font-size: 24px;
  font-weight: 700;
}
.content {
  padding: 24px;
}
</style>


