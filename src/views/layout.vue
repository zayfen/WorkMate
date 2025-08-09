<script setup lang="ts">
import SidebarNav from '@/components/sidebar-nav/sidebar-nav.vue'
import LanMembersPanel from '@/components/lan-members-panel/lan-members-panel.vue'
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
  overflow: hidden;
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
.content {
  box-sizing: border-box;
  height: 100vh;
  padding: 24px;
}
</style>


