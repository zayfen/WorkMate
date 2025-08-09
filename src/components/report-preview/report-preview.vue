<script setup lang='ts'>
</script>

<template>
  <div class='preview'>
    <h2 class='title'>周报预览</h2>
    <div class='summary'>
      <div class='col'>
        <div class='num'>20</div>
        <div class='label'>总数</div>
      </div>
      <div class='col'>
        <div class='num'>12</div>
        <div class='label'>完成</div>
      </div>
      <div class='col'>
        <div class='num'>60%</div>
        <div class='label'>完成率</div>
      </div>
    </div>
    <div class='paper'>
      <p>报告正文示例 —— Apple Pages 风格</p>
    </div>
  </div>
</template>

<style scoped>
.preview { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; display: grid; gap: 12px }
.title { font-size: 20px; font-weight: 700 }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px }
.col { background: rgba(0,0,0,0.03); border-radius: 12px; padding: 16px; text-align: center }
.num { font-weight: 700; font-size: 18px }
.label { color: #6b7280; font-size: 12px }
.paper { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; min-height: 160px }
</style>


