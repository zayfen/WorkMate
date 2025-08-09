<script setup lang='ts'>
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <teleport to="body">
    <div v-if="props.open" class='mask' @click.self="emit('close')">
      <div class='modal'>
        <header class='head'>
          <h3>编辑任务</h3>
          <button class='link' @click="emit('close')">取消</button>
        </header>
        <section class='body'>
          <div class='form'>
            <label>标题</label>
            <input placeholder='任务标题' />
            <label>描述</label>
            <textarea rows='3' placeholder='任务描述' />
            <label>项目</label>
            <select><option>项目 A</option></select>
            <label>负责人</label>
            <select><option>张伟</option></select>
            <label>起止时间</label>
            <div class='pair'>
              <input type='datetime-local' />
              <span>—</span>
              <input type='datetime-local' />
            </div>
            <label>优先级</label>
            <div class='prio'>
              <button class='dot high' />
              <button class='dot med' />
              <button class='dot low' />
            </div>
            <label>标签</label>
            <input placeholder='输入生成标签' />
            <label>附件</label>
            <button class='link'>+ 添加附件</button>
          </div>
        </section>
        <footer class='foot'>
          <button class='link' @click="emit('close')">取消</button>
          <button class='primary'>保存</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.mask { position: fixed; inset: 0; background: rgba(0,0,0,0.2); display: grid; place-items: center }
.modal { width: 720px; max-width: calc(100vw - 32px); background: rgba(255,255,255,0.7); backdrop-filter: saturate(180%) blur(20px); border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden }
.head, .foot { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff }
.body { padding: 12px 16px; max-height: 60vh; overflow: auto }
.form { display: grid; grid-template-columns: 1fr; gap: 8px }
input, textarea, select { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff }
.pair { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px }
.prio { display: flex; gap: 8px }
.dot { width: 18px; height: 18px; border-radius: 50%; border: none }
.dot.high { background: #ff3b30 }
.dot.med { background: #ffcc00 }
.dot.low { background: #007aff }
.primary { background: #007aff; color: #fff; border: none; padding: 8px 12px; border-radius: 10px }
.link { background: transparent; border: none; color: #007aff; cursor: pointer }
</style>


