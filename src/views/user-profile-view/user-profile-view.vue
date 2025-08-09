<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const note = ref('')
const deviceId = ref('WM-DEVICE-0001')
</script>

<template>
  <div class="profile">
    <div class="avatar">WM</div>
    <button class="link-btn">更换头像</button>

    <div class="form">
      <label>姓名</label>
      <input v-model="name" placeholder="输入姓名" />

      <label>备注</label>
      <textarea v-model="note" rows="4" placeholder="个性签名或备注" />

      <label>设备 ID</label>
      <input :value="deviceId" disabled />

      <div class="actions">
        <button class="primary">保存</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile { display: flex; flex-direction: column; align-items: center; gap: 16px }
.avatar { width: 96px; height: 96px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 24px }
.link-btn { background: transparent; border: none; color: #007aff; cursor: pointer }
.form { display: grid; grid-template-columns: 1fr; gap: 8px; width: 420px; max-width: 100% }
input, textarea { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff }
.actions { display: flex; justify-content: flex-end }
.primary { background: #007aff; color: #fff; border: none; padding: 10px 16px; border-radius: 12px }
</style>


