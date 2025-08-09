<script setup lang='ts'>
const props = defineProps<{ title: string, due: string, project: string }>()
</script>

<template>
  <div class='item'>
    <input type='checkbox' />
    <div class='main'>
      <div class='title'>{{ props.title }}</div>
      <div class='sub'>截止：{{ props.due }}</div>
    </div>
    <div class='tag'>{{ props.project }}</div>
  </div>
  
</template>

<style scoped>
.item { display: grid; grid-template-columns: 20px 1fr auto; align-items: center; gap: 8px; padding: 8px; border-radius: 10px }
.item:hover { background: rgba(0,0,0,0.03) }
.title { font-weight: 600 }
.sub { color: #6b7280; font-size: 12px }
.tag { font-size: 12px; background: rgba(0,122,255,0.1); color: #007aff; padding: 4px 8px; border-radius: 999px }
</style>


