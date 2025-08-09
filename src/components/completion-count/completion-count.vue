<script setup lang='ts'>
const props = defineProps<{ count: number }>()
</script>

<template>
  <div class='box'>
    <div class='num'>{{ props.count }}</div>
    <div class='label'>完成项</div>
  </div>
</template>

<style scoped>
.box { background: rgba(0,0,0,0.03); border-radius: 12px; padding: 16px; text-align: center }
.num { font-weight: 700; font-size: 24px }
.label { color: #6b7280; font-size: 12px }
</style>


