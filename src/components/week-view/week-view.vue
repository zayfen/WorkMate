<script setup lang='ts'>
type WeekDayStat = {
  date: number // start of day timestamp
  label: string // 周一..周日
  total: number
  done: number
  in_progress: number
  todo: number
}

const props = defineProps<{ days: WeekDayStat[] }>()
const emit = defineEmits<{ 'day-click': [payload: { date: number }] }>()

function percent(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class='week'>
    <button
      v-for='d in props.days'
      :key='d.date'
      type='button'
      class='col'
      @click="emit('day-click', { date: d.date })"
    >
      <div class='head'>{{ d.label }} <span class='sub'>{{ formatDate(d.date) }}</span></div>
      <div class='counts'>
        <span class='num todo' title='未开始'>{{ d.todo }}</span>
        <span class='num in_progress' title='进行中'>{{ d.in_progress }}</span>
        <span class='num done' title='已完成'>{{ d.done }}</span>
        <span class='total' title='总数'>{{ d.total }}</span>
      </div>
      <div class='bar'><div class='fill' :style="{ width: percent(d.done, d.total) + '%' }" /></div>
    </button>
  </div>
</template>

<style scoped>
.week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px }
.col { text-align: left; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px; cursor: pointer }
.col:hover { background: rgba(0,0,0,0.02) }
.head { font-weight: 600; display: flex; align-items: baseline; gap: 6px }
.sub { color: #6b7280; font-size: 12px; font-weight: 400 }
.counts { display: flex; align-items: baseline; gap: 8px; margin: 8px 0 6px }
.num { font-weight: 700; font-size: 14px }
.num.todo { color: #b45309 }
.num.in_progress { color: #1e40af }
.num.done { color: #065f46 }
.total { margin-left: auto; font-size: 12px; color: #6b7280 }
.bar { height: 6px; background: #e5e7eb; border-radius: 999px }
.fill { height: 100%; background: #10b981; border-radius: 999px }
</style>


