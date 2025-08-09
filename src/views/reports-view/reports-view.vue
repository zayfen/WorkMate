<script setup lang="ts">
import ReportGenerator from '@/components/report-generator/report-generator.vue'
import ReportPreview from '@/components/report-preview/report-preview.vue'
import ExportButtons from '@/components/export-buttons/export-buttons.vue'
</script>

<template>
  <div class="reports">
    <ReportGenerator />
    <ReportPreview />
    <ExportButtons />
  </div>
</template>

<style scoped>
.reports { display: flex; flex-direction: column; gap: 12px }
</style>


