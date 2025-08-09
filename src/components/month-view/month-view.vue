<script setup lang='ts'>
const days = Array.from({ length: 30 }, (_, i) => i + 1)
</script>

<template>
  <div class='month'>
    <div v-for='d in days' :key='d' class='cell' :class="{ today: d === 15 }">
      <div class='date'>{{ d }}</div>
      <div class='dots'>
        <span class='dot' />
        <span class='dot' />
      </div>
    </div>
  </div>
</template>

<style scoped>
.month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px }
.cell { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px; min-height: 64px }
.date { font-weight: 600 }
.dots { display: flex; gap: 4px; margin-top: 6px }
.dot { width: 6px; height: 6px; border-radius: 50%; background: #007aff }
.today { outline: 2px solid #007aff }
</style>


