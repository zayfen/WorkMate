<script setup lang='ts'>
type TaskStatus = 'todo' | 'in_progress' | 'done'
type TaskPriority = 'low' | 'medium' | 'high'

const props = defineProps<{
  status: 'all' | TaskStatus
  priority: 'all' | TaskPriority
  projectId: number | 'all'
  due: 'today' | 'this_week' | 'this_month' | 'all'
  includeDone: boolean
  projects: Array<{ id: number, title: string }>
}>()

const emit = defineEmits<{
  'update:status': [value: 'all' | TaskStatus]
  'update:priority': [value: 'all' | TaskPriority]
  'update:project-id': [value: number | 'all']
  'update:due': [value: 'today' | 'this_week' | 'this_month' | 'all']
  'update:include-done': [value: boolean]
  'create-task': []
}>()

function onChange<K extends 'status' | 'priority' | 'project-id' | 'due'>(key: K, value: any) {
  // passthrough
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(`update:${key}` as any, value)
}
</script>

<template>
  <div class='bar'>
    <div class='left'>
      <select :value="props.status" @change="onChange('status', ($event.target as HTMLSelectElement).value as any)">
        <option value='all'>全部状态</option>
        <option value='todo'>未开始</option>
        <option value='in_progress'>进行中</option>
        <option value='done'>已完成</option>
      </select>

      <select :value="props.priority" @change="onChange('priority', ($event.target as HTMLSelectElement).value as any)">
        <option value='all'>所有优先级</option>
        <option value='high'>高</option>
        <option value='medium'>中</option>
        <option value='low'>低</option>
      </select>

      <select :value="props.projectId === 'all' ? 'all' : String(props.projectId)" @change="onChange('project-id', (() => { const v = ($event.target as HTMLSelectElement).value; return v === 'all' ? 'all' : Number(v) })())">
        <option value='all'>全部项目</option>
        <option v-for='p in props.projects' :key='p.id' :value='String(p.id)'>{{ p.title }}</option>
      </select>

      <select :value="props.due" @change="onChange('due', ($event.target as HTMLSelectElement).value as any)">
        <option value='today'>今天</option>
        <option value='this_week'>本周</option>
        <option value='this_month'>本月</option>
        <option value='all'>全部日期</option>
      </select>

      <button type='button' class='secondary' :class="{ active: props.includeDone }" @click="emit('update:include-done', !props.includeDone)">
        {{ props.includeDone ? '隐藏已完成' : '显示已完成' }}
      </button>
    </div>
    <div class='right'>
      <button class='primary' @click="emit('create-task')">创建任务</button>
    </div>
  </div>
  
</template>

<style scoped>
.bar { display: grid; grid-template-columns: 1fr auto; gap: 8px; background: #fff; border: 1px solid #e5e7eb; padding: 8px; border-radius: 12px }
.left { display: flex; gap: 8px; align-items: center; flex-wrap: wrap }
select, input, button.secondary { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff }
button.secondary.active { background: #f3f4f6 }
.primary { background: #111827; color: #fff; border: none; padding: 8px 12px; border-radius: 10px }
</style>


