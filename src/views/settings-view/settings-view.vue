<script setup lang="ts">
import NotificationsSettings from '@/components/notifications-settings/notifications-settings.vue'
import LanSettings from '@/components/lan-settings/lan-settings.vue'
import ExportSettings from '@/components/export-settings/export-settings.vue'
</script>

<template>
  <div class="settings">
    <NotificationsSettings />
    <LanSettings />
    <ExportSettings />
  </div>
</template>

<style scoped>
.settings { display: grid; grid-template-columns: 1fr; gap: 12px }
</style>


