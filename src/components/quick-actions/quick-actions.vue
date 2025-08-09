<script setup lang='ts'>
const emit = defineEmits<{ 'create-task': [], 'view-week': [], 'export-weekly-report': [] }>()
</script>

<template>
  <div class='actions'>
    <button class='link' @click="emit('create-task')">新建任务</button>
    <button class='link' @click="emit('view-week')">查看本周</button>
    <button class='link' @click="emit('export-weekly-report')">导出周报告</button>
  </div>
</template>

<style scoped>
.actions { display: flex; gap: 12px; align-items: center; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px 12px }
.link { background: transparent; border: none; color: #007aff; cursor: pointer }
</style>


