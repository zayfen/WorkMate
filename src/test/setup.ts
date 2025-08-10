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
      saveReportPdf: async () => true,
      // LAN stubs to satisfy components during unit tests
      lanListOnline: async () => [
        { deviceId: 'peer-1', name: 'Peer 1', lastSeen: Date.now() }
      ],
      lanListConversations: async () => [
        { deviceId: 'peer-1', name: 'Peer 1', lastMessageText: 'hi', lastMessageTs: Date.now(), lastSeen: Date.now() }
      ],
      lanSendChat: async () => true,
      lanListTodayMessages: async () => []
    },
    configurable: true
  })
}

// vue-advanced-chat 在 JSDOM 下需要 AudioContext，提供最小 polyfill
if (!(window as any).AudioContext) {
  ;(window as any).AudioContext = function () {}
}
if (!(window as any).webkitAudioContext) {
  ;(window as any).webkitAudioContext = (window as any).AudioContext
}

// Mock canvas for Chart.js in JSDOM
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: function () {
    return {
      canvas: this,
      // minimal stubs used by Chart.js sizing
      createLinearGradient: () => ({ addColorStop: () => {} }),
      measureText: () => ({ width: 0 }),
      setTransform: () => {},
      save: () => {},
      restore: () => {},
      fillRect: () => {},
      clearRect: () => {},
      translate: () => {},
      scale: () => {},
      stroke: () => {},
      fill: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      strokeRect: () => {}
    } as unknown as CanvasRenderingContext2D
  },
  configurable: true
})

// toDataURL mock used by export
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: () => 'data:image/png;base64,' + btoa('stub'),
  configurable: true
})


