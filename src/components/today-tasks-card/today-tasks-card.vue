<script setup lang='ts'>
import { ref } from 'vue'
import TaskItemSimple from '@/components/task-item-simple/task-item-simple.vue'

type SimpleTask = { id: number, title: string, due: string, project: string, done?: boolean }

const tasks = ref<SimpleTask[]>([
  { id: 1, title: '整理日报', due: '今天 18:00', project: '日常' },
  { id: 2, title: '产品评审会', due: '今天 16:00', project: '项目 A' },
  { id: 3, title: '更新 Roadmap', due: '今天 20:00', project: '项目 B' }
])
</script>

<template>
  <div class='card'>
    <div class='card-header'>
      <h3>今日待办</h3>
      <button class='plus'>+</button>
    </div>
    <div class='list'>
      <TaskItemSimple v-for='t in tasks' :key='t.id' :title='t.title' :due='t.due' :project='t.project' />
    </div>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px }
.plus { background: #007aff; color: #fff; border: none; width: 28px; height: 28px; border-radius: 8px; cursor: pointer }
.list { display: flex; flex-direction: column; gap: 8px }
</style>


