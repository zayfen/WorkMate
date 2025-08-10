<script setup lang='ts'>
import { ref } from 'vue'
const props = defineProps<{ peerId?: string }>()
const text = ref('')

async function send() {
  const t = text.value.trim()
  if (!t) return
  await window?.api?.lanSendChat?.({ text: t, to: props.peerId })
  text.value = ''
}
</script>

<template>
  <div class='bar'>
    <input v-model="text" @keyup.enter="send" placeholder='输入消息，支持粘贴图片/视频/音频链接' />
    <button class='send' @click="send">发送</button>
  </div>
</template>

<style scoped>
.bar { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 8px; border-top: 1px solid #e5e7eb; background: #fff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px }
input { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px }
.send { background: #007aff; color: #fff; border: none; padding: 10px 16px; border-radius: 12px }
</style>


