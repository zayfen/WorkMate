<script setup lang='ts'>
import CompletionCount from '@/components/completion-count/completion-count.vue'
import CircularProgress from '@/components/circular-progress/circular-progress.vue'
import TrendBadge from '@/components/trend-badge/trend-badge.vue'

const props = defineProps<{
  doneCount: number
  completionPercent: number
  trendPercent: number
}>()
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-3">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-800">本周概览</h3>
      <span class="text-xs text-gray-400">周一 — 周日</span>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <CompletionCount :count='props.doneCount' />
      <CircularProgress :value='props.completionPercent' />
      <TrendBadge :value='props.trendPercent' />
    </div>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px }
</style>


