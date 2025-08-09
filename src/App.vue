
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  console.log("App mounted!")
})
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>


