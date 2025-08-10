<script setup lang='ts'>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ activePeerId?: string }>()

type Conv = { deviceId: string; name: string; preview: string; ts: number }
const list = ref<Conv[]>([])
const router = useRouter()
let timer: number | null = null

async function refresh() {
  const [conv, online] = await Promise.all([
    window?.api?.lanListConversations?.(),
    window?.api?.lanListOnline?.()
  ])
  const byId = new Map<string, Conv>()
  for (const c of conv ?? []) {
    byId.set(c.deviceId, { deviceId: c.deviceId, name: c.name, preview: c.lastMessageText, ts: c.lastMessageTs || c.lastSeen })
  }
  for (const p of online ?? []) {
    if (!byId.has(p.deviceId)) {
      byId.set(p.deviceId, { deviceId: p.deviceId, name: p.name, preview: '', ts: p.lastSeen })
    }
  }
  const arr = Array.from(byId.values())
  arr.sort((a, b) => b.ts - a.ts)
  list.value = arr
}

function openConversation(id?: string) {
  router.push({ name: 'messages', query: id ? { to: id } : {} })
}

const isActive = (id?: string) => (props.activePeerId ? id === props.activePeerId : !id)

onMounted(() => {
  refresh()
  timer = window.setInterval(refresh, 3000)
})
onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <ul class='list'>
    <li class='item broadcast' :class='{ active: isActive(undefined) }' @click='openConversation()'>
      <div class='avatar'>全</div>
      <div class='main'>
        <div class='top'>
          <span class='name'>广播（全员）</span>
          <span class='time'></span>
        </div>
        <div class='preview'>向所有在线成员发消息</div>
      </div>
    </li>
    <li v-for='c in list' :key='c.deviceId' class='item' :class='{ active: isActive(c.deviceId) }' @click='openConversation(c.deviceId)'>
      <div class='avatar'>{{ c.name.slice(0,1) }}</div>
      <div class='main'>
        <div class='top'>
          <span class='name'>{{ c.name }}</span>
          <span class='time'>{{ new Date(c.ts || Date.now()).toLocaleTimeString() }}</span>
        </div>
        <div class='preview'>{{ c.preview }}</div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 8px; display: grid; gap: 6px }
.item { display: grid; grid-template-columns: 36px 1fr auto; gap: 8px; align-items: center; padding: 8px; border-radius: 10px; cursor: pointer }
.item:hover { background: rgba(0,0,0,0.04) }
.item.active { background: rgba(10,132,255,0.08) }
.broadcast .avatar { background: #0a84ff; color: #fff }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #e5e7eb; display: grid; place-items: center; font-weight: 600 }
.top { display: flex; align-items: center; justify-content: space-between }
.name { font-weight: 600 }
.time { color: #6b7280; font-size: 12px }
.preview { color: #6b7280; font-size: 12px }
.red-dot { width: 8px; height: 8px; background: #ff3b30; border-radius: 50% }
</style>


