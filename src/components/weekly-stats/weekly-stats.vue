<script setup lang='ts'>
import CompletionCount from '@/components/completion-count/completion-count.vue'
import CircularProgress from '@/components/circular-progress/circular-progress.vue'
import TrendBadge from '@/components/trend-badge/trend-badge.vue'
</script>

<template>
  <div class='card'>
    <div class='head'><h3>本周概览</h3></div>
    <div class='stats'>
      <CompletionCount :count='12' />
      <CircularProgress :value='68' />
      <TrendBadge :value='12' />
    </div>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px }
</style>


