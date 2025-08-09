<script setup lang='ts'>
import { ref } from 'vue'
const type = ref('周')
const range = ref({ from: '', to: '' })
</script>

<template>
  <div class='panel'>
    <div class='row'>
      <label>报告类型</label>
      <div class='seg'>
        <button class='btn active'>日</button>
        <button class='btn'>周</button>
        <button class='btn'>月</button>
        <button class='btn'>年</button>
      </div>
    </div>
    <div class='row'>
      <label>日期范围</label>
      <div class='pair'>
        <input type='date' v-model="range.from" />
        <span>—</span>
        <input type='date' v-model="range.to" />
      </div>
    </div>
    <div class='row'>
      <button class='primary'>生成报告</button>
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


