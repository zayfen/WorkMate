<script setup lang='ts'>
import { ref } from 'vue'
const enableReminders = ref(true)
const advance = ref('1小时')
const morning = ref(false)
const morningTime = ref('09:00')
const evening = ref(true)
const eveningTime = ref('18:00')
const playSound = ref(true)
</script>

<template>
  <div class='card'>
    <h3>通知设置</h3>
    <div class='group'>
      <div class='row'><label>任务提醒</label><input type='checkbox' v-model="enableReminders" /></div>
      <div class='row'><label>提前提醒</label>
        <select v-model="advance"><option>1小时</option><option>6小时</option><option>1天</option></select>
      </div>
    </div>
    <div class='group'>
      <div class='row'><label>早间提醒</label><input type='checkbox' v-model="morning" /> <input type='time' v-model="morningTime" /></div>
      <div class='row'><label>晚间总结</label><input type='checkbox' v-model="evening" /> <input type='time' v-model="eveningTime" /></div>
    </div>
    <div class='group'>
      <div class='row'><label>声音</label><input type='checkbox' v-model="playSound" /></div>
      <div class='row'><button class='btn'>播放测试音</button></div>
    </div>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: grid; gap: 8px }
.group { display: grid; gap: 6px }
.row { display: flex; align-items: center; gap: 8px }
.btn { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 6px 10px }
</style>


