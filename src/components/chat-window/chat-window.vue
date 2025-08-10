<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue'

type Msg = { id: number; me?: boolean; text: string; ts: number }
const messages = ref<Msg[]>([])
const activePeer = ref<string | null>(null)

async function load() {
  const rows = (await window?.api?.lanListTodayMessages?.(activePeer.value ?? undefined)) ?? []
  const myId = await window?.api?.getDeviceId?.()
  messages.value = rows.map(r => ({ id: r.id, text: r.text, ts: r.ts, me: r.from_device_id === myId }))
}

onMounted(load)
watch(activePeer, load)
</script>

<template>
  <div class='win'>
    <div v-for='m in messages' :key='m.id' class='bubble' :class="{ me: m.me }">{{ m.text }}</div>
  </div>
</template>

<style scoped>
.win { padding: 12px; overflow: auto }
.bubble { max-width: 60%; margin: 6px 0; padding: 10px 12px; border-radius: 18px; background: #fff; border: 1px solid #e5e7eb }
.bubble.me { margin-left: auto; background: #007aff; color: #fff; border: none }
</style>


