<script setup lang='ts'>
const props = defineProps<{ label: string, priority: 'high' | 'medium' | 'low' }>()
const bg = props.priority === 'high' ? '#ff3b30' : props.priority === 'medium' ? '#ffcc00' : '#007aff'
</script>

<template>
  <div class='chip' :style="{ background: bg }">{{ props.label }}</div>
</template>

<style scoped>
.chip { color: #fff; border-radius: 20px; height: 40px; display: flex; align-items: center; justify-content: center }
</style>


