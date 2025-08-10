<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReportGranularity } from '@/utils/report-types'
import { computeDateRange } from '@/utils/date-range'
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'

const emit = defineEmits<{
  (e: 'generate', payload: { granularity: ReportGranularity; from: number; to: number }): void
}>()

const granularity = ref<ReportGranularity>('week')
const dayFrom = ref<string>('')
const dayTo = ref<string>('')
const weekAnchor = ref<string>('')
const monthAnchor = ref<string>('')
const yearAnchor = ref<string>('')
const halfYearAnchor = ref<string>('')

const computedRange = computed(() => {
  const todayIso = new Date().toISOString().slice(0, 10)
  const anchorStr = granularity.value === 'day' ? (dayFrom.value || todayIso)
    : granularity.value === 'week' ? (weekAnchor.value || todayIso)
    : granularity.value === 'month' ? (monthAnchor.value || todayIso)
    : (yearAnchor.value || todayIso)
  const anchor = new Date(anchorStr)
  if (granularity.value === 'day' && dayFrom.value && dayTo.value) {
    const from = new Date(dayFrom.value)
    const to = new Date(dayTo.value)
    const { from: f, to: t } = computeDateRange({ granularity: 'day', anchor, from, to })
    return { from: f, to: t }
  }
  if (granularity.value === 'half-year') {
    const d = halfYearAnchor.value ? new Date(halfYearAnchor.value) : anchor
    const { from, to } = computeDateRange({ granularity: 'half-year', anchor: d })
    return { from, to }
  }
  const { from, to } = computeDateRange({ granularity: granularity.value, anchor })
  return { from, to }
})

function onGenerate() {
  emit('generate', { granularity: granularity.value, from: computedRange.value.from, to: computedRange.value.to })
}
</script>

<template>
  <div class="panel">
    
    <div class="row">
      <label>报告类型</label>
      <div class="seg">
        <button class="btn" :class="{ active: granularity==='day' }" @click="granularity='day'">日</button>
        <button class="btn" :class="{ active: granularity==='week' }" @click="granularity='week'">周</button>
        <button class="btn" :class="{ active: granularity==='month' }" @click="granularity='month'">月</button>
        <button class="btn" :class="{ active: granularity==='half-year' }" @click="granularity='half-year'">半年</button>
        <button class="btn" :class="{ active: granularity==='year' }" @click="granularity='year'">年</button>
      </div>
    </div>
    <div class="row" v-if="granularity==='day'">
      <label>按天选择</label>
      <div class="pair">
        <DatePicker v-model:value="dayFrom" type="date" value-type="YYYY-MM-DD" placeholder="开始日期" />
        <span>—</span>
        <DatePicker v-model:value="dayTo" type="date" value-type="YYYY-MM-DD" placeholder="结束日期" />
      </div>
    </div>
    <div class="row" v-else-if="granularity==='week'">
      <label>按周选择</label>
      <DatePicker v-model:value="weekAnchor" type="date" value-type="YYYY-MM-DD" placeholder="任意一天" />
    </div>
    <div class="row" v-else-if="granularity==='month'">
      <label>按月选择</label>
      <DatePicker v-model:value="monthAnchor" type="month" value-type="YYYY-MM" placeholder="选择月份" />
    </div>
    <div class="row" v-else-if="granularity==='half-year'">
      <label>按半年</label>
      <DatePicker v-model:value="halfYearAnchor" type="month" value-type="YYYY-MM" placeholder="选择上/下半年任一月" />
    </div>
    <div class="row" v-else>
      <label>按年选择</label>
      <DatePicker v-model:value="yearAnchor" type="year" value-type="YYYY" placeholder="选择年份" />
    </div>
    <div class="row">
      <button class="primary" @click="onGenerate">生成报告</button>
    </div>
  </div>
</template>

<style scoped>
.panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: grid; gap: 8px }
.row { display: grid; grid-template-columns: 120px 1fr; align-items: center; gap: 8px }
.seg { display: inline-flex; background: rgba(0,0,0,0.06); padding: 4px; border-radius: 12px }
.btn { background: transparent; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer }
.btn.active { background: #fff }
.pair { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px }
.primary { background: #007aff; color: #fff; border: none; padding: 8px 12px; border-radius: 10px }
 
</style>



