<script setup lang="ts">
import { ref } from 'vue'
import FilterBar from '@/components/filter-bar/filter-bar.vue'
import TasksList from '@/components/tasks-list/tasks-list.vue'
import TaskEditorModal from '@/components/task-editor-modal/task-editor-modal.vue'

const showEditor = ref(false)
</script>

<template>
  <div class="tasks-view">
    <FilterBar @create-task="showEditor=true" />
    <TasksList />
    <TaskEditorModal :open="showEditor" @close="showEditor=false" />
  </div>
</template>

<style scoped>
.tasks-view { display: flex; flex-direction: column; gap: 12px }
</style>


