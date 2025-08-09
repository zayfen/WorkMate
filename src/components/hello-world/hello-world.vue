<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<template>
  <div class="hello">
    <p class="message">{{ msg }}</p>
  </div>
</template>

<style scoped>
.message {
  font-weight: 600;
}
</style>


