<script setup lang='ts'>
import { ref } from 'vue'
type Conv = { id: number, name: string, preview: string, time: string, unread?: boolean }
const list = ref<Conv[]>([
  { id: 1, name: '李娜', preview: '明天评审', time: '10:20', unread: true },
  { id: 2, name: '张伟', preview: '收到', time: '昨天' }
])
</script>

<template>
  <ul class='list'>
    <li v-for='c in list' :key='c.id' class='item'>
      <div class='avatar'>{{ c.name.slice(0,1) }}</div>
      <div class='main'>
        <div class='top'>
          <span class='name'>{{ c.name }}</span>
          <span class='time'>{{ c.time }}</span>
        </div>
        <div class='preview'>{{ c.preview }}</div>
      </div>
      <span v-if='c.unread' class='red-dot' />
    </li>
  </ul>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 8px; display: grid; gap: 6px }
.item { display: grid; grid-template-columns: 36px 1fr auto; gap: 8px; align-items: center; padding: 8px; border-radius: 10px }
.item:hover { background: rgba(0,0,0,0.03) }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: #e5e7eb; display: grid; place-items: center; font-weight: 600 }
.top { display: flex; align-items: center; justify-content: space-between }
.name { font-weight: 600 }
.time { color: #6b7280; font-size: 12px }
.preview { color: #6b7280; font-size: 12px }
.red-dot { width: 8px; height: 8px; background: #ff3b30; border-radius: 50% }
</style>


