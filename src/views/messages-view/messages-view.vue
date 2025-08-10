<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { register } from 'vue-advanced-chat'

register()

type Room = {
  roomId: string
  roomName: string
  avatar: string
  users: Array<{ _id: string; username: string; avatar: string; status: { state: 'online' | 'offline'; lastChanged: string } }>
  lastMessage?: { _id: string; content: string; senderId: string; username?: string; timestamp?: string; saved?: boolean; distributed?: boolean; seen?: boolean; new?: boolean }
  unreadCount?: number
}

type Message = {
  _id: string
  content?: string
  senderId: string
  username?: string
  timestamp?: string
  system?: boolean
  saved?: boolean
  distributed?: boolean
  seen?: boolean
}

const route = useRoute()
const currentUserId = ref<string>('me')
const peerId = computed(() => typeof route.query.to === 'string' ? route.query.to : undefined)
const rooms = ref<Room[]>([])
const messages = ref<Message[]>([])
const messagesLoaded = ref<boolean>(true)
const roomsLoaded = ref<boolean>(false)
const usernameOptions = { minUsers: 1, currentUser: true }

async function loadRooms() {
  const me = await window?.api?.getDeviceId?.()
  currentUserId.value = me || 'me'

  const conv = (await window?.api?.lanListConversations?.()) ?? []
  const online = (await window?.api?.lanListOnline?.()) ?? []
  const meId = currentUserId.value
  const allRooms: Room[] = []
  // 广播房间
  allRooms.push({
    roomId: 'broadcast',
    roomName: '广播（全员）',
    avatar: '',
    users: online.filter(p => p.deviceId !== meId).map(p => ({ _id: p.deviceId, username: p.name, avatar: '', status: { state: 'online', lastChanged: '' } })),
    lastMessage: undefined,
    unreadCount: 0
  })
  // 单聊房间
  for (const p of online) {
    if (p.deviceId === meId) continue
    const last = conv.find(c => c.deviceId === p.deviceId)
    allRooms.push({
      roomId: p.deviceId,
      roomName: p.name,
      avatar: '',
      users: [
        { _id: meId, username: '我', avatar: '', status: { state: 'online', lastChanged: '' } },
        { _id: p.deviceId, username: p.name, avatar: '', status: { state: 'online', lastChanged: '' } }
      ],
      lastMessage: last && last.lastMessageText ? { _id: String(last.lastMessageTs || Date.now()), content: last.lastMessageText, senderId: meId, timestamp: new Date(last.lastMessageTs || 0).toLocaleTimeString() } : undefined,
      unreadCount: 0
    })
  }
  rooms.value = allRooms
  roomsLoaded.value = true
}

onMounted(async () => {
  await loadRooms()
  // 如果 URL 指定了 to，选中对应房间，否则默认广播
  if (peerId.value) {
    await fetchMessages({ room: { roomId: peerId.value } as any, options: { reset: true } })
  } else {
    await fetchMessages({ room: { roomId: 'broadcast' } as any, options: { reset: true } })
  }
  // 定时刷新在线用户与会话，避免左侧列表卡在 loading
  setInterval(loadRooms, 5000)
})

watch(() => peerId.value, async (next) => {
  if (!next) {
    await fetchMessages({ room: { roomId: 'broadcast' } as any, options: { reset: true } })
  } else {
    await fetchMessages({ room: { roomId: next } as any, options: { reset: true } })
  }
})

async function fetchMessages(payload: { room: { roomId: string }; options?: { reset?: boolean } }) {

  const { room } = payload
  messagesLoaded.value = false
  const withDeviceId = room.roomId === 'broadcast' ? undefined : room.roomId
  console.log("loading messages: ", withDeviceId)
  const rows = (await window?.api?.lanListTodayMessages?.(withDeviceId)) ?? []
  const me = currentUserId.value
  const mapped: Message[] = rows.map(r => ({
    _id: String(r.id),
    content: r.text,
    senderId: r.from_device_id,
    username: r.from_device_id === me ? '我' : (rooms.value.find(rm => rm.roomId === r.from_device_id)?.roomName || findPeerName(r.from_device_id) || r.from_device_id),
    timestamp: new Date(r.ts).toLocaleTimeString(),
    saved: true,
    distributed: true,
    seen: true
  }))
  messages.value = mapped
  messagesLoaded.value = true
}

function findPeerName(deviceId: string): string | undefined {
  const room = rooms.value.find(r => r.roomId === deviceId)
  if (room) return room.roomName
  return undefined
}

async function sendMessage(payload: { roomId: string; content: string }) {
  console.log("sendMessage: ", payload)
  const { roomId, content } = payload;
  const text = String(content || '').trim()
  if (!text) return
  const to = roomId === 'broadcast' ? undefined : roomId
  await window?.api?.lanSendChat?.({ text, to })
  // 重新拉取该房间消息
  await fetchMessages({ room: { roomId }, options: { reset: true } })
}
</script>

<template>
  <div class="messages-chat">
    <vue-advanced-chat
      :height="'calc(100vh - 140px)'"
      :current-user-id="currentUserId"
      :rooms="rooms"
      :rooms-loaded="roomsLoaded"
      :room-id="peerId || 'broadcast'"
      :messages="messages"
      :messages-loaded="messagesLoaded"
      :username-options="usernameOptions"
      :room-info-enabled="true"
      :show-files="false"
      :show-audio="false"
      :show-reaction-emojis="false"
      :single-room="false"
      theme="light"
      @fetch-messages="(evt: unknown) => fetchMessages(Array.isArray(evt.detail) ? evt.detail[0] : evt.detail)"
      @send-message="(evt: unknown) => sendMessage(Array.isArray(evt.detail) ? evt.detail[0] : evt.detail)"
    />
  </div>
</template>

<style scoped>
.messages-chat { height: 100%; min-height: 0 }
</style>


