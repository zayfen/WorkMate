<script setup lang='ts'>
const props = defineProps<{ value: number }>()
const pct = Math.max(0, Math.min(100, Math.round(props.value)))
</script>

<template>
  <div class="relative grid place-items-center">
    <svg viewBox="0 0 42 42" class="h-20 w-20">
      <circle cx="21" cy="21" r="18" fill="none" class="stroke-gray-200" stroke-width="4" />
      <circle
        cx="21" cy="21" r="18" fill="none"
        class="stroke-green-500"
        stroke-width="4"
        :stroke-dasharray="`${pct * 1.13} ${113 - pct * 1.13}`"
        stroke-linecap="round"
        transform="rotate(-90 21 21)"
      />
    </svg>
    <div class="absolute text-sm font-semibold text-gray-800">{{ pct }}%</div>
  </div>
</template>

<style scoped>
.stroke-gray-200 { stroke: #e5e7eb }
.stroke-green-500 { stroke: #22c55e }
</style>


