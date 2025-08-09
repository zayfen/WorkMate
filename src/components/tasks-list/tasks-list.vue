<script setup lang='ts'>
import { ref } from 'vue'

type Row = { id: number, title: string, project: string, assignee: string, due: string, priority: '高' | '中' | '低' }
const rows = ref<Row[]>([
  { id: 1, title: '撰写需求', project: '项目 A', assignee: '张伟', due: '2024-08-01', priority: '高' },
  { id: 2, title: '接口联调', project: '项目 B', assignee: '李娜', due: '2024-08-03', priority: '中' }
])
</script>

<template>
  <div class='table'>
    <div class='row head'>
      <div class='cell w-32'></div>
      <div class='cell'>标题</div>
      <div class='cell'>项目</div>
      <div class='cell'>负责人</div>
      <div class='cell'>截止</div>
      <div class='cell w-48'>优先级</div>
    </div>
    <div class='row' v-for='r in rows' :key='r.id'>
      <div class='cell w-32'><input type='checkbox' /></div>
      <div class='cell'>{{ r.title }}</div>
      <div class='cell'>{{ r.project }}</div>
      <div class='cell'>{{ r.assignee }}</div>
      <div class='cell'>{{ r.due }}</div>
      <div class='cell w-48'>
        <span class='prio' :class="r.priority">{{ r.priority }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table { display: grid; gap: 4px }
.row { display: grid; grid-template-columns: 32px 1.5fr 1fr 1fr 1fr 64px; align-items: center; height: 44px; padding: 0 8px; border-radius: 12px }
.row.head { color: #6b7280 }
.row:not(.head):hover { background: rgba(0,0,0,0.03) }
.cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.w-32 { width: 32px }
.w-48 { width: 64px }
.prio { display: inline-block; min-width: 40px; text-align: center; font-size: 12px; padding: 2px 6px; border-radius: 999px; color: #fff }
.prio.高 { background: #ff3b30 }
.prio.中 { background: #ffcc00; color: #111 }
.prio.低 { background: #007aff }
</style>


