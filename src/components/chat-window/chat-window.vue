<script setup lang='ts'>
import { ref } from 'vue'
type Msg = { id: number, me?: boolean, text: string }
const messages = ref<Msg[]>([
  { id: 1, text: '你好' },
  { id: 2, me: true, text: '在的' }
])
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


