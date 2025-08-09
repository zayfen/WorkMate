<script setup lang='ts'>
import { ref } from 'vue'
const format = ref<'HTML'|'Markdown'|'PDF'>('HTML')
</script>

<template>
  <div class='card'>
    <h3>导出设置</h3>
    <div class='row'>默认导出格式：</div>
    <div class='row'>
      <label><input type='radio' value='HTML' v-model="format" /> HTML</label>
      <label><input type='radio' value='Markdown' v-model="format" /> Markdown</label>
      <label><input type='radio' value='PDF' v-model="format" /> PDF</label>
    </div>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: grid; gap: 8px }
.row { display: flex; align-items: center; gap: 12px }
</style>


