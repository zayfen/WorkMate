<script setup lang='ts'>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

const props = defineProps<{ peerId?: string }>()
const peerName = ref<string>('广播（全员）')

type Msg = { id: number; me?: boolean; text: string; ts: number }
const messages = ref<Msg[]>([])
let timer: number | null = null
const scrollerRef = ref<InstanceType<typeof DynamicScroller> | null>(null)

async function load() {
  const rows = (await window?.api?.lanListTodayMessages?.(props.peerId)) ?? []
  const myId = await window?.api?.getDeviceId?.()
  messages.value = rows.map(r => ({ id: r.id, text: r.text, ts: r.ts, me: r.from_device_id === myId }))
  // resolve peer name
  if (!props.peerId) {
    peerName.value = '广播（全员）'
  } else {
    const conv = (await window?.api?.lanListConversations?.()) ?? []
    const found = conv.find(c => c.deviceId === props.peerId)
    peerName.value = found?.name || '未知'
  }
  await nextTick()
  try {
    scrollerRef.value?.scrollToItem(messages.value.length - 1)
  } catch {
    const list = document.querySelector('.win .list') as HTMLElement | null
    if (list) list.scrollTop = list.scrollHeight
  }
}

onMounted(() => {
  load()
  timer = window.setInterval(load, 2000)
})
onBeforeUnmount(() => { if (timer) window.clearInterval(timer) })
watch(() => props.peerId, load)
watch(() => messages.value.length, async () => {
  await nextTick()
  try { scrollerRef.value?.scrollToItem(messages.value.length - 1) } catch {}
})

function isUrl(text: string): boolean { return /^https?:\/\//i.test(text) }
function isImage(text: string): boolean { return text.startsWith('data:image/') || (isUrl(text) && /\.(png|jpe?g|gif|webp)$/i.test(text)) }
function isVideo(text: string): boolean { return text.startsWith('data:video/') || (isUrl(text) && /\.(mp4|webm|ogg)$/i.test(text)) }
function isAudio(text: string): boolean { return text.startsWith('data:audio/') || (isUrl(text) && /\.(mp3|wav|ogg)$/i.test(text)) }
</script>

<template>
  <div class='win'>
    <div class='header'>和 {{ peerName }} 的会话</div>
    <DynamicScroller
      ref="scrollerRef"
      class="list"
      :items="messages"
      key-field="id"
      :min-item-size="56"
    >
      <DynamicScrollerItem
        v-for="item in messages"
        :key="item.id"
        :item="item"
      >
        <div class='bubble' :class="{ me: item.me }">
          <div class='meta'>{{ item.me ? '我' : peerName }}</div>
          <template v-if="isImage(item.text)">
            <img :src="item.text" class="media-img" alt="image" />
          </template>
          <template v-else-if="isVideo(item.text)">
            <video :src="item.text" class="media-video" controls />
          </template>
          <template v-else-if="isAudio(item.text)">
            <audio :src="item.text" controls />
          </template>
          <template v-else>
            <a v-if="isUrl(item.text)" :href="item.text" target="_blank" rel="noreferrer">{{ item.text }}</a>
            <span v-else class='text'>{{ item.text }}</span>
          </template>
        </div>
      </DynamicScrollerItem>
    </DynamicScroller>
  </div>
</template>

<style scoped>
.win { height: 100%; min-height: 0; display: flex; flex-direction: column; background: #f6f6f7 }
.header { text-align: center; color: #6b7280; font-size: 12px; margin: 6px 0 12px }
.list { flex: 1; min-height: 0; overflow: auto; padding: 0 12px 12px }
.bubble { max-width: 66%; margin: 6px 8px; padding: 10px 12px; border-radius: 16px; background: #fff; border: 1px solid #e5e7eb; font-size: 13px; line-height: 1.4 }
.bubble.me { margin-left: auto; background: #0a84ff; color: #fff; border: none }
.bubble .meta { font-size: 11px; opacity: .7; margin-bottom: 4px }
.bubble.me .meta { color: rgba(255,255,255,.85) }
.text { color: #111 }
.media-img { max-width: 320px; border-radius: 12px; display: block }
.media-video { max-width: 360px; border-radius: 12px; display: block }
</style>


