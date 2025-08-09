<script setup lang='ts'>
const emit = defineEmits<{ 'export-html': [], 'export-md': [], 'export-pdf': [] }>()
</script>

<template>
  <div class='row'>
    <button class='btn' @click="emit('export-html')">导出 HTML</button>
    <button class='btn' @click="emit('export-md')">导出 Markdown</button>
    <button class='btn' @click="emit('export-pdf')">导出 PDF</button>
  </div>
</template>

<style scoped>
.row { display: flex; gap: 8px }
.btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; cursor: pointer }
</style>


