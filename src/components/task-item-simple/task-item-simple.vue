<script setup lang='ts'>
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{ id: number; title: string; due: string; project: string; status: 'todo' | 'in_progress' | 'done' }>()
const emit = defineEmits<{ advance: [id: number] }>()

const checkboxEl = ref<HTMLInputElement | null>(null)

function updateIndeterminate() {
  if (!checkboxEl.value) return
  checkboxEl.value.indeterminate = props.status === 'in_progress'
}

onMounted(updateIndeterminate)
watch(() => props.status, updateIndeterminate)
</script>

<template>
  <div class="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50">
    <input
      ref="checkboxEl"
      type="checkbox"
      :checked="props.status === 'done'"
      :disabled="props.status === 'done'"
      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
      @change="emit('advance', props.id)"
    />
    <div class="flex-1 min-w-0">
      <div
        class="truncate font-medium text-sm"
        :class="props.status === 'in_progress' ? 'text-blue-700' : props.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-700'"
      >
        {{ props.title }}
      </div>
      <div class="text-xs" :class="props.status === 'done' ? 'text-gray-400' : 'text-gray-500'">截止：{{ props.due }}</div>
    </div>
    <div
      class="text-xs rounded-full px-2 py-0.5"
      :class="props.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : props.status === 'done' ? 'bg-gray-50 text-gray-400' : 'bg-gray-100 text-gray-700'"
    >
      {{ props.project }}
    </div>
  </div>
  
</template>

<style scoped>
</style>


