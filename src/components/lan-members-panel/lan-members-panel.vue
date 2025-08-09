<script setup lang="ts">
import { ref } from 'vue'

type Member = { id: number, name: string, status: '在线' | '空闲' | '离线' }

const members = ref<Member[]>([
  { id: 1, name: '张伟', status: '在线' },
  { id: 2, name: '李娜', status: '空闲' },
  { id: 3, name: '王强', status: '离线' }
])

const statusColor = (status: Member['status']) =>
  status === '在线' ? '#34C759' : status === '空闲' ? '#8E8E93' : '#C7C7CC'
</script>

<template>
  <div class="panel">
    <ul class="member-list">
      <li v-for="m in members" :key="m.id" class="member">
        <div class="avatar">{{ m.name.slice(0,1) }}</div>
        <div class="info">
          <div class="name">{{ m.name }}</div>
          <div class="status">
            <span class="dot" :style="{ background: statusColor(m.status) }" />
            {{ m.status }}
          </div>
        </div>
        <button class="msg-btn">发送消息</button>
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


