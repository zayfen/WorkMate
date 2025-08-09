<script setup lang='ts'>
import { ref } from 'vue'
type Project = { id: number, title: string, desc: string, progress: number, owner: string }
const projects = ref<Project[]>([
  { id: 1, title: '项目 A', desc: '项目 A 描述...', progress: 0.4, owner: '李娜' },
  { id: 2, title: '项目 B', desc: '项目 B 描述...', progress: 0.7, owner: '张伟' }
])
</script>

<template>
  <div class='grid'>
    <div v-for='p in projects' :key='p.id' class='card'>
      <div class='title'>{{ p.title }}</div>
      <div class='desc'>{{ p.desc }}</div>
      <div class='progress'>
        <div class='bar'><div class='fill' :style="{ width: `${Math.round(p.progress*100)}%` }" /></div>
        <div class='owner'>{{ p.owner }}</div>
      </div>
      <div class='ops'>
        <button class='link'>编辑</button>
        <button class='link'>删除</button>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.title { font-weight: 700; font-size: 16px }
.desc { color: #6b7280; font-size: 12px; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
.bar { height: 6px; background: #e5e7eb; border-radius: 999px; margin-top: 8px }
.fill { height: 100%; background: #007aff; border-radius: 999px }
.progress { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px }
.owner { font-size: 12px; color: #6b7280 }
.ops { display: none; gap: 8px; margin-top: 8px }
.card:hover .ops { display: flex }
.link { background: transparent; border: none; color: #007aff; cursor: pointer }
</style>


