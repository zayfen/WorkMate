<script setup lang='ts'>
const props = defineProps<{ value: number }>()
</script>

<template>
  <div class='circle'>
    <div class='inner'>{{ props.value }}%</div>
  </div>
</template>

<style scoped>
.circle { width: 88px; height: 88px; border-radius: 50%; border: 6px solid #e5e7eb; position: relative }
.circle::after { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 6px solid #34c759; border-right-color: transparent; border-bottom-color: transparent }
.inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 600 }
</style>


