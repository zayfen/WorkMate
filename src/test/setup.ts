// Vitest 全局测试初始化（可在此扩展 expect 或 polyfill）

// 注入最小 window.api stub，避免组件挂载时报错
if (!('api' in window)) {
  Object.defineProperty(window, 'api', {
    value: {
      ping: async () => 'pong',
      getUserProfile: async () => ({
        id: 1,
        name: 'Test User',
        avatar_path: null,
        avatar_base64: null,
        note: 'note',
        local_id: 'local_user',
        last_seen: Date.now(),
        device_info: null
      }),
      saveUserProfile: async (payload: { name?: string; note?: string; avatar_base64?: string | null }) => ({
        id: 1,
        name: payload.name ?? 'Test User',
        avatar_path: null,
        avatar_base64: payload.avatar_base64 ?? null,
        note: payload.note ?? 'note',
        local_id: 'local_user',
        last_seen: Date.now(),
        device_info: null
      }),
      getDeviceId: async () => 'device-stub-123',
      chooseAvatar: async () => null
      ,
      listTasks: async () => [],
      saveReportText: async () => true,
      saveReportPdf: async () => true
    },
    configurable: true
  })
}


