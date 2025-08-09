<script setup lang='ts'>
const months = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
</script>

<template>
  <div class='year'>
    <div v-for='m in months' :key='m' class='box'>
      <div class='name'>{{ m }}月</div>
      <div class='num'>12</div>
    </div>
  </div>
</template>

<style scoped>
.year { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px }
.box { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px }
.name { color: #6b7280 }
.num { font-weight: 700; font-size: 20px }
</style>


