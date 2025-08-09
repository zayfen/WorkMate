<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

const name = ref('')
const note = ref('')
const deviceId = ref('')
const avatarPath = ref<string | null>(null)
const avatarBase64 = ref<string | null>(null)
const isSaving = ref(false)
const toast = useToast()

async function loadProfile() {
  try {
    const profile = await window.api?.getUserProfile?.()
    const id = await window.api?.getDeviceId?.()
    console.log("profile: ", profile)
    console.log("id:", id);
    deviceId.value = id ?? ''
    if (profile) {
      name.value = profile.name ?? ''
      note.value = profile.note ?? ''
      avatarPath.value = profile.avatar_path ?? null
      avatarBase64.value = profile.avatar_base64 ?? null
    }
  } catch {
    // ignore
  }
}

async function onSave() {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const updated = await window.api?.saveUserProfile?.({ name: name.value, note: note.value, avatar_base64: avatarBase64.value })
    if (updated) {
      name.value = updated.name ?? ''
      note.value = updated.note ?? ''
      avatarPath.value = updated.avatar_path ?? null
      avatarBase64.value = updated.avatar_base64 ?? null
    }
    toast.success('保存成功')
  } catch (e) {
    toast.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

async function onChooseAvatar() {
  const selected = await window.api?.chooseAvatar?.()
  if (selected) {
    avatarBase64.value = selected
    avatarPath.value = null
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="profile">
    <div class="avatar">
      <img v-if="avatarBase64 || avatarPath" :src="avatarBase64 || avatarPath || ''" alt="avatar" />
      <span v-else>WM</span>
    </div>
    <button class="link-btn" @click="onChooseAvatar">更换头像</button>

    <div class="form">
      <label>姓名</label>
      <input v-model="name" placeholder="输入姓名" />

      <label>备注</label>
      <textarea v-model="note" rows="4" placeholder="个性签名或备注" />

      <label>设备 ID</label>
      <input :value="deviceId" disabled />

      <div class="actions">
        <button class="primary" :disabled="isSaving" @click="onSave">{{ isSaving ? '保存中…' : '保存' }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile { display: flex; flex-direction: column; align-items: center; gap: 16px }
.avatar { width: 96px; height: 96px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 24px; overflow: hidden }
.avatar img { width: 100%; height: 100%; object-fit: cover }
.link-btn { background: transparent; border: none; color: #007aff; cursor: pointer }
.form { display: grid; grid-template-columns: 1fr; gap: 8px; width: 420px; max-width: 100% }
input, textarea { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff }
.actions { display: flex; justify-content: flex-end }
.primary { background: #007aff; color: #fff; border: none; padding: 10px 16px; border-radius: 12px }
</style>


