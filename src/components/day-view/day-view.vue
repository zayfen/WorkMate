<script setup lang='ts'>
import EventChip from '@/components/event-chip/event-chip.vue'
</script>

<template>
  <div class='day'>
    <div class='timeline'>
      <div v-for='h in 12' :key='h' class='slot'>
        <span class='time'>{{ h + 8 }}:00</span>
        <div class='line' />
      </div>
      <EventChip label='设计评审' priority='high' style='grid-row: 3 / span 2' />
      <EventChip label='开发联调' priority='medium' style='grid-row: 6 / span 1' />
    </div>
  </div>
</template>

<style scoped>
.day { height: 520px; overflow: auto }
.timeline { position: relative; display: grid; grid-template-rows: repeat(12, 1fr); gap: 8px }
.slot { display: grid; grid-template-columns: 60px 1fr; align-items: center; gap: 8px }
.time { color: #6b7280; font-size: 12px; justify-self: end }
.line { height: 1px; background: #e5e7eb }
</style>


