import { defineConfig } from 'vite'

// 生产环境下仅构建 Electron 主进程与预加载，避免解析 .vue
export default defineConfig({
  appType: 'custom',
  build: {
    outDir: 'dist-electron',
    target: 'node20',
    sourcemap: true,
    ssr: true,
    rollupOptions: {
      external: ['electron'],
      input: {
        main: 'electron/main.ts',
        preload: 'electron/preload.ts'
      },
      output: {
        dir: 'dist-electron',
        format: 'cjs',
        entryFileNames: (chunk) => {
          if (chunk.name === 'main') return 'main/index.cjs'
          if (chunk.name === 'preload') return 'preload/preload.cjs'
          return '[name].cjs'
        }
      }
    },
    emptyOutDir: false
  }
})


