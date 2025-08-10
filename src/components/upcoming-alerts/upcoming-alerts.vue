<script setup lang='ts'>
type AlertItem = { id: number, title: string, remain: string }
const props = defineProps<{ alerts: AlertItem[] }>()
</script>

<template>
  <div class='card'>
    <div class='card-header'><h3>即将到期</h3></div>
    <ul class='list'>
      <li v-for='a in props.alerts' :key='a.id'>
        <span class='title'>{{ a.title }}</span>
        <span class='remain'>{{ a.remain }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px }
li { display: flex; align-items: center; justify-content: space-between }
.title { color: #ff3b30; font-weight: 600 }
.remain { color: #6b7280; font-size: 12px }
</style>


