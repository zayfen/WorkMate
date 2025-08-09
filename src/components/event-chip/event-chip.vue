<script setup lang='ts'>
const props = defineProps<{ label: string, priority: 'high' | 'medium' | 'low' }>()
const bg = props.priority === 'high' ? '#ff3b30' : props.priority === 'medium' ? '#ffcc00' : '#007aff'
</script>

<template>
  <div class='chip' :style="{ background: bg }">
    <span class='label'>{{ props.label }}</span>
  </div>
</template>

<style scoped>
.chip {
  width: 100%;
  color: #fff;
  border-radius: 12px;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
.label {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>


