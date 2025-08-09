<script setup lang="ts">
import { ref } from 'vue'
import SegmentedControl from '@/components/segmented-control/segmented-control.vue'
import DayView from '@/components/day-view/day-view.vue'
import WeekView from '@/components/week-view/week-view.vue'
import MonthView from '@/components/month-view/month-view.vue'
import YearView from '@/components/year-view/year-view.vue'

const mode = ref('week')
const options = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
  { label: '年', value: 'year' }
]
</script>

<template>
  <div class="calendar">
    <SegmentedControl v-model="mode" :options="options" />
    <div class="calendar-body">
      <DayView v-if="mode==='day'" />
      <WeekView v-else-if="mode==='week'" />
      <MonthView v-else-if="mode==='month'" />
      <YearView v-else />
    </div>
  </div>
</template>

<style scoped>
.calendar { display: flex; flex-direction: column; gap: 12px }
.calendar-body { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
</style>


