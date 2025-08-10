<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

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

const router = useRouter()

function sendMessage(to: string) {
  const text = prompt('输入要发送的消息：') || ''
  if (!text) return
  window?.api?.lanSendChat?.({ to, text })
  // 发送后跳转到消息页并定位会话
  router.push({ name: 'messages', query: { to } })
}

function openChat(to: string) {
  router.push({ name: 'messages', query: { to } })
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
      <li v-for="m in members" :key="m.deviceId" class="member" @click="openChat(m.deviceId)">
        <div class="avatar">{{ m.name.slice(0,1) }}</div>
        <div class="info">
          <div class="name">{{ m.name }}</div>
          <div class="status">
            <span class="dot" :style="{ background: statusColor() }" />
            在线
          </div>
        </div>
        <button class="msg-btn" @click.stop="sendMessage(m.deviceId)">发送</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.panel { background: rgba(255,255,255,0.6); border: 1px solid #e5e7eb; border-radius: 12px; padding: 6px }
.member-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px }
.member { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 10px; cursor: pointer }
.member:hover { background: rgba(0,0,0,0.04) }
.avatar { width: 28px; height: 28px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px }
.name { font-weight: 600; font-size: 13px }
.status { font-size: 11px; color: #6b7280; display: flex; align-items: center; gap: 6px }
.dot { width: 6px; height: 6px; border-radius: 50% }
.msg-btn { opacity: 0; transition: opacity .2s; background: transparent; border: none; color: #0a84ff; cursor: pointer; font-size: 12px }
.member:hover .msg-btn { opacity: 1 }
</style>


