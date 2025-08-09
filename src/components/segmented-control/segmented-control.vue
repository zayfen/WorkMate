<script setup lang='ts'>
type Option = { label: string, value: string }
const props = defineProps<{ modelValue: string, options: Option[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const onPick = (value: string) => emit('update:modelValue', value)
</script>

<template>
  <div class='seg'>
    <button v-for='o in props.options' :key='o.value' class='btn' :class="{ active: o.value===props.modelValue }" @click="onPick(o.value)">{{ o.label }}</button>
  </div>
</template>

<style scoped>
.seg { display: inline-flex; background: rgba(0,0,0,0.06); padding: 4px; border-radius: 12px }
.btn { background: transparent; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer }
.btn.active { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.06) }
</style>


