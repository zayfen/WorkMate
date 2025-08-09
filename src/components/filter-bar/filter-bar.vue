<script setup lang='ts'>
const emit = defineEmits<{ 'create-task': [] }>()
</script>

<template>
  <div class='bar'>
    <div class='left'>
      <select>
        <option>全部</option>
        <option>未开始</option>
        <option>进行中</option>
        <option>完成</option>
        <option>延期</option>
      </select>
      <select>
        <option>所有优先级</option>
        <option>高</option>
        <option>中</option>
        <option>低</option>
      </select>
      <input placeholder='标签' />
      <select>
        <option>全部项目</option>
      </select>
    </div>
    <div class='right'>
      <button class='primary' @click="emit('create-task')">创建任务</button>
    </div>
  </div>
</template>

<style scoped>
.bar { display: grid; grid-template-columns: 1fr auto; gap: 8px; background: #fff; border: 1px solid #e5e7eb; padding: 8px; border-radius: 12px }
.left { display: flex; gap: 8px; align-items: center }
select, input { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 10px }
.primary { background: #007aff; color: #fff; border: none; padding: 8px 12px; border-radius: 10px }
</style>


