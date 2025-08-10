<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ storageKey?: string }>()
const note = ref('')
const saving = ref(false)

async function load() {
  try {
    const key = props.storageKey || 'sticky_note_default'
    const val = await (window.api as any)?.getSetting?.(key)
    if (typeof val === 'string') note.value = val
  } catch {}
}

async function save() {
  try {
    saving.value = true
    const key = props.storageKey || 'sticky_note_default'
    await (window.api as any)?.setSetting?.(key, note.value)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-yellow-900">便签</h3>
      <button class="text-xs text-yellow-800 hover:underline" @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
    </div>
    <textarea v-model="note" rows="6" class="w-full resize-none rounded-md border border-yellow-200 bg-yellow-100/70 p-2 text-sm text-yellow-900 outline-none focus:ring-1 focus:ring-yellow-400" placeholder="快速记录你的想法..." />
  </div>
  
</template>

<style scoped>
</style>


