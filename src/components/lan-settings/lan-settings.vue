<script setup lang='ts'>
import { ref } from 'vue'
const enable = ref(true)
const interval = ref('30秒')
const signing = ref(false)
</script>

<template>
  <div class='card'>
    <h3>局域网设置</h3>
    <div class='row'><label>启用发现</label><input type='checkbox' v-model="enable" /></div>
    <div class='row'><label>广播间隔</label>
      <select v-model="interval"><option>15秒</option><option>30秒</option><option>60秒</option></select>
    </div>
    <div class='row'><label>消息签名（高级）</label><input type='checkbox' v-model="signing" /></div>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: grid; gap: 8px }
.row { display: flex; align-items: center; gap: 8px }
</style>


