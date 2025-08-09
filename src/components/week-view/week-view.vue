<script setup lang='ts'>
const days = ['一', '二', '三', '四', '五', '六', '日']
</script>

<template>
  <div class='week'>
    <div class='col' v-for='d in days' :key='d'>
      <div class='head'>周{{ d }}</div>
      <div class='count'>3 任务</div>
      <div class='bar'><div class='fill' style='width: 60%' /></div>
    </div>
  </div>
</template>

<style scoped>
.week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px }
.col { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px }
.head { font-weight: 600 }
.count { font-size: 12px; color: #6b7280 }
.bar { height: 6px; background: #e5e7eb; border-radius: 999px }
.fill { height: 100%; background: #34c759; border-radius: 999px }
</style>


