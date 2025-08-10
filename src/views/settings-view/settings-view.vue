<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import NotificationsSettings from '@/components/notifications-settings/notifications-settings.vue'
import LanSettings from '@/components/lan-settings/lan-settings.vue'

// 用户资料（迁移自 user-profile-view）
const name = ref('')
const note = ref('')
const deviceId = ref('')
const avatarPath = ref<string | null>(null)
const avatarBase64 = ref<string | null>(null)
const isSavingProfile = ref(false)

// LLM 设置
const llmBaseUrl = ref('')
const llmModel = ref('')
const llmApiKey = ref('')
const llmSaving = ref(false)
const llmKeyVisible = ref(false)

const toast = useToast()

async function loadProfile() {
  try {
    const profile = await window.api?.getUserProfile?.()
    const id = await window.api?.getDeviceId?.()
    deviceId.value = id ?? ''
    if (profile) {
      name.value = profile.name ?? ''
      note.value = profile.note ?? ''
      avatarPath.value = profile.avatar_path ?? null
      avatarBase64.value = profile.avatar_base64 ?? null
    }
  } catch {}
}

async function onChooseAvatar() {
  const selected = await window.api?.chooseAvatar?.()
  if (selected) {
    avatarBase64.value = selected
    avatarPath.value = null
  }
}

async function onSaveProfile() {
  if (isSavingProfile.value) return
  isSavingProfile.value = true
  try {
    const updated = await window.api?.saveUserProfile?.({ name: name.value, note: note.value, avatar_base64: avatarBase64.value })
    if (updated) {
      name.value = updated.name ?? ''
      note.value = updated.note ?? ''
      avatarPath.value = updated.avatar_path ?? null
      avatarBase64.value = updated.avatar_base64 ?? null
    }
    toast.success('个人资料已保存')
  } catch {
    toast.error('保存失败，请重试')
  } finally {
    isSavingProfile.value = false
  }
}

async function loadLlmSettings() {
  try {
    llmBaseUrl.value = (await window.api?.getSetting?.('llm_base_url')) ?? ''
    llmModel.value = (await window.api?.getSetting?.('llm_model')) ?? ''
    llmApiKey.value = (await window.api?.getSetting?.('llm_api_key')) ?? ''
  } catch {}
}

async function onSaveLlm() {
  if (llmSaving.value) return
  llmSaving.value = true
  try {
    await window.api?.setSetting?.('llm_base_url', llmBaseUrl.value.trim())
    await window.api?.setSetting?.('llm_model', llmModel.value.trim())
    await window.api?.setSetting?.('llm_api_key', llmApiKey.value.trim())
    toast.success('LLM 参数已保存')
  } catch {
    toast.error('保存失败，请重试')
  } finally {
    llmSaving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProfile(), loadLlmSettings()])
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">设置</h1>
    </div>

    <!-- 个人资料 -->
    <section class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 class="text-base font-medium text-gray-900 dark:text-gray-100">个人资料</h2>
        <p class="mt-1 text-sm text-gray-500">更新头像、姓名与个性签名</p>
      </div>
      <div class="p-5 space-y-5">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-lg font-semibold text-gray-600">
            <img v-if="avatarBase64 || avatarPath" :src="avatarBase64 || avatarPath || ''" alt="avatar" class="w-full h-full object-cover" />
            <span v-else>WM</span>
          </div>
          <button type="button" class="text-blue-600 hover:text-blue-700 text-sm font-medium" @click="onChooseAvatar">更换头像</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="block text-sm text-gray-600">姓名</label>
            <input v-model="name" type="text" placeholder="输入姓名" class="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 px-3 py-2" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm text-gray-600">设备 ID</label>
            <input :value="deviceId" disabled class="block w-full rounded-xl border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 px-3 py-2" />
          </div>
          <div class="space-y-1 md:col-span-2">
            <label class="block text-sm text-gray-600">备注</label>
            <textarea v-model="note" rows="3" placeholder="个性签名或备注" class="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 px-3 py-2"></textarea>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="button" :disabled="isSavingProfile" class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50" @click="onSaveProfile">
            {{ isSavingProfile ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </section>

    <!-- LLM 设置 -->
    <section class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
      <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 class="text-base font-medium text-gray-900 dark:text-gray-100">LLM 设置</h2>
        <p class="mt-1 text-sm text-gray-500">配置 Base URL、模型与 API Key</p>
      </div>
      <div class="p-5 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1 md:col-span-2">
            <label class="block text-sm text-gray-600">Base URL</label>
            <input v-model="llmBaseUrl" type="text" placeholder="例如：https://api.openai.com/v1" class="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 px-3 py-2" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm text-gray-600">Model</label>
            <input v-model="llmModel" type="text" placeholder="例如：gpt-4o-mini / llama3.1:8b" class="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 px-3 py-2" />
          </div>
          <div class="space-y-1">
            <label class="block text-sm text-gray-600">API Key</label>
            <div class="relative">
              <input :type="llmKeyVisible ? 'text' : 'password'" v-model="llmApiKey" placeholder="••••••••" class="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 px-3 py-2 pr-10" />
              <button type="button" class="absolute inset-y-0 right-0 px-3 text-sm text-gray-500" @click="llmKeyVisible = !llmKeyVisible">{{ llmKeyVisible ? '隐藏' : '显示' }}</button>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button type="button" :disabled="llmSaving" class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50" @click="onSaveLlm">
            {{ llmSaving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </section>

    <!-- 其他设置分组 -->
    <section class="grid grid-cols-1 gap-4">
      <NotificationsSettings />
      <LanSettings />
    </section>
  </div>
</template>
