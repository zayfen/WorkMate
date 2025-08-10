<script setup lang='ts'>
import { computed } from 'vue'
import TaskItemSimple from '@/components/task-item-simple/task-item-simple.vue'

type SimpleTask = { id: number, title: string, due: string, project: string, status: 'todo' | 'in_progress' | 'done' }

const props = defineProps<{ tasks: SimpleTask[] }>()
const emit = defineEmits<{ 'create-task': []; 'advance-task': [payload: { id: number }] }>()

const sorted = computed(() => {
  const items = Array.isArray(props.tasks) ? props.tasks.slice() : []
  // order: in_progress -> todo -> done
  const order = (s: SimpleTask['status']) => (s === 'in_progress' ? 0 : s === 'todo' ? 1 : 2)
  return items.sort((a, b) => order(a.status) - order(b.status))
})

function handleAdvance(id: number) { emit('advance-task', { id }) }
</script>

<template>
  <div class='card'>
    <div class='card-header'>
      <h3>今日待办</h3>
      <button class='plus' @click="emit('create-task')">+</button>
    </div>
    <div class='list'>
      <TaskItemSimple
        v-for='t in sorted'
        :key='t.id'
        :id='t.id'
        :title='t.title'
        :due='t.due'
        :project='t.project'
        :status='t.status'
        @advance='handleAdvance'
      />
    </div>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px }
.plus { background: #0a84ff; color: #fff; border: none; width: 28px; height: 28px; border-radius: 8px; cursor: pointer }
.list { display: flex; flex-direction: column; gap: 6px }
</style>


