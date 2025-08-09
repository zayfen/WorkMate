import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const enableElectronBuild = !isDev && process.env.ELECTRON_BUILD === '1'
  return {
    // 使用相对资源路径，确保通过 file:// 协议加载时资源可被正确解析
    base: './',
    plugins: [
      vue(),
      // 仅在显式构建 Electron 时启用插件；开发期只保留渲染层插件
      ...(enableElectronBuild ? [
        electron({
          main: {
            entry: 'electron/main.ts',
            vite: {
              appType: 'custom',
              build: {
                ssr: true,
                outDir: 'dist-electron/main',
                target: 'node20',
                sourcemap: true,
                rollupOptions: {
                  external: ['electron', 'better-sqlite3'],
                  input: 'electron/main.ts',
                  output: { format: 'cjs', entryFileNames: 'index.cjs' }
                }
              }
            }
          },
          preload: {
            input: { preload: 'electron/preload.ts' },
            vite: {
              appType: 'custom',
              build: {
                ssr: true,
                outDir: 'dist-electron/preload',
                target: 'node20',
                sourcemap: 'inline',
                rollupOptions: {
                  external: ['electron'],
                  input: 'electron/preload.ts',
                  output: { format: 'cjs', entryFileNames: 'preload.cjs' }
                }
              }
            }
          }
        }),
        renderer()
      ] : [renderer()])
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist'
    },
    server: {
      port: 5173,
      strictPort: true,
      open: false
    }
  }
})


