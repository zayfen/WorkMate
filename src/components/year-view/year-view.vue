<script setup lang='ts'>
type HalfStat = {
  year: number
  half: 1 | 2
  label: string // 上半年 / 下半年
  total: number
  done: number
  in_progress: number
  todo: number
}

const props = defineProps<{ halves: HalfStat[] }>()
const emit = defineEmits<{ 'half-click': [payload: { year: number, half: 1 | 2 }] }>()

function percent(done: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((done / total) * 100)
}
</script>

<template>
  <div class='year-halves'>
    <button
      v-for='h in props.halves'
      :key='h.half'
      type='button'
      class='half-card'
      @click="emit('half-click', { year: h.year, half: h.half })"
    >
      <div class='head'>
        <div class='name'>{{ h.label }}</div>
        <div class='numbers'>
          <span class='num todo' title='未开始'>{{ h.todo }}</span>
          <span class='num in_progress' title='进行中'>{{ h.in_progress }}</span>
          <span class='num done' title='已完成'>{{ h.done }}</span>
        </div>
      </div>
      <div class='total' title='总数'>共 {{ h.total }}</div>
      <div class='bar'><div class='fill' :style="{ width: percent(h.done, h.total) + '%' }" /></div>
    </button>
  </div>
  
</template>

<style scoped>
.year-halves { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px }
.half-card { text-align: left; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; cursor: pointer }
.half-card:hover { background: rgba(0,0,0,0.02) }
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


