<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

type OnlinePeer = { deviceId: string; name: string; lastSeen: number }

const members = ref<OnlinePeer[]>([])
let timer: number | null = null

async function refresh() {
  const [list, myId] = await Promise.all([
    window?.api?.lanListOnline?.(),
    window?.api?.getDeviceId?.()
  ])
  members.value = (list ?? []).filter(p => p.deviceId !== (myId ?? ''))
}

function sendMessage(to: string) {
  const text = prompt('输入要发送的消息：') || ''
  if (!text) return
  window?.api?.lanSendChat?.({ to, text })
}

onMounted(() => {
  refresh()
  timer = window.setInterval(refresh, 3000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
  timer = null
})

function statusColor() {
  return '#34C759'
}
</script>

<template>
  <div class="panel">
    <ul class="member-list">
      <li v-for="m in members" :key="m.deviceId" class="member">
        <div class="avatar">{{ m.name.slice(0,1) }}</div>
        <div class="info">
          <div class="name">{{ m.name }}</div>
          <div class="status">
            <span class="dot" :style="{ background: statusColor() }" />
            在线
          </div>
        </div>
        <button class="msg-btn" @click="sendMessage(m.deviceId)">发送消息</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.panel { background: rgba(255,255,255,0.6); border: 1px solid #e5e7eb; border-radius: 12px; padding: 8px }
.member-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px }
.member { display: grid; grid-template-columns: 32px 1fr auto; align-items: center; gap: 8px; padding: 6px; border-radius: 10px }
.member:hover { background: rgba(0,0,0,0.03) }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600 }
.name { font-weight: 600 }
.status { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 6px }
.dot { width: 8px; height: 8px; border-radius: 50% }
.msg-btn { opacity: 0; transition: opacity .2s; background: transparent; border: none; color: #007aff; cursor: pointer }
.member:hover .msg-btn { opacity: 1 }
</style>


