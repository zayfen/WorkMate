<script setup lang="ts">
import { onMounted, ref } from 'vue'

const pingResult = ref<string>('')
onMounted(async () => {
  try {
    if (window?.api?.ping) {
      pingResult.value = await window.api.ping()
    }
  } catch (err) {
    // ignore in non-electron env (tests)
  }
})
</script>

<template>
  <header class="header">
    <nav class="nav">
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>
  </header>
  <main class="content">
    <RouterView />
  </main>
  <footer class="footer">
    <small>Electron ping: {{ pingResult || 'n/a' }}</small>
  </footer>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.nav {
  display: flex;
  gap: 12px;
}
.content {
  padding: 24px;
}
.footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  color: #6b7280;
}
</style>


