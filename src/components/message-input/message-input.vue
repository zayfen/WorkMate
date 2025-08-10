<script setup lang='ts'>
import { ref } from 'vue'
const text = ref('')

async function send() {
  const t = text.value.trim()
  if (!t) return
  await window?.api?.lanSendChat?.({ text: t })
  text.value = ''
}
</script>

<template>
  <div class='bar'>
    <input v-model="text" @keyup.enter="send" placeholder='输入消息' />
    <button class='send' @click="send">发送</button>
  </div>
</template>

<style scoped>
.bar { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 8px; border-top: 1px solid #e5e7eb }
input { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px }
.send { background: #007aff; color: #fff; border: none; padding: 10px 16px; border-radius: 12px }
</style>


