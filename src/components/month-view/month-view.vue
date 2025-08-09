<script setup lang='ts'>
type MonthCardStat = {
  year: number
  month: number // 0..11
  label: string // 一..十二
  total: number
  done: number
  in_progress: number
  todo: number
}

const props = defineProps<{ months: MonthCardStat[] }>()
const emit = defineEmits<{ 'month-click': [payload: { year: number, month: number }] }>()

function percent(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}
</script>

<template>
  <div class='months'>
    <button
      v-for='m in props.months'
      :key='m.month'
      type='button'
      class='cell'
      @click="emit('month-click', { year: m.year, month: m.month })"
    >
      <div class='head'>
        <div class='name'>{{ m.label }}月</div>
        <div class='numbers'>
          <span class='num todo' title='未开始'>{{ m.todo }}</span>
          <span class='num in_progress' title='进行中'>{{ m.in_progress }}</span>
          <span class='num done' title='已完成'>{{ m.done }}</span>
        </div>
      </div>
      <div class='total' title='总数'>共 {{ m.total }}</div>
      <div class='bar'><div class='fill' :style="{ width: percent(m.done, m.total) + '%' }" /></div>
    </button>
  </div>
  
</template>

<style scoped>
.months { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px }
.cell { text-align: left; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 10px; cursor: pointer }
.cell:hover { background: rgba(0,0,0,0.02) }
.head { display: flex; align-items: baseline; justify-content: space-between }
.name { font-weight: 600 }
.numbers { display: flex; align-items: baseline; gap: 6px }
.num { font-weight: 700; font-size: 14px }
.num.todo { color: #b45309 }
.num.in_progress { color: #1e40af }
.num.done { color: #065f46 }
.total { margin: 6px 0; font-size: 12px; color: #6b7280 }
.bar { height: 6px; background: #e5e7eb; border-radius: 999px }
.fill { height: 100%; background: #10b981; border-radius: 999px }
</style>


