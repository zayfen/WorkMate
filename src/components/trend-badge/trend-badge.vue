<script setup lang='ts'>
const props = defineProps<{ value: number }>()
</script>

<template>
  <div class='badge' :class="{ up: props.value >= 0, down: props.value < 0 }">
    <span>{{ props.value >= 0 ? '↑' : '↓' }}</span>
    <b>{{ Math.abs(props.value) }}%</b>
  </div>
</template>

<style scoped>
.badge { display: inline-flex; gap: 6px; align-items: center; padding: 8px 10px; border-radius: 999px; background: rgba(0,0,0,0.03) }
.up { color: #34c759 }
.down { color: #ff3b30 }
</style>


