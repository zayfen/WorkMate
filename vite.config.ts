import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const enableElectronBuild = isDev || process.env.ELECTRON_BUILD === '1'
  return {
    // 使用相对资源路径，确保通过 file:// 协议加载时资源可被正确解析
    base: './',
    plugins: [
      vue(),
      ...(enableElectronBuild
        ? [
            electron({
        main: {
          entry: 'electron/main.ts',
          onstart({ startup }) {
            // 自动启动 Electron，使用 package.json 的 main 字段
            startup()
          },
          vite: {
            appType: 'custom',
            build: {
              ssr: true,
              outDir: 'dist-electron/main',
              target: 'node20',
              sourcemap: true,
              rollupOptions: {
                input: 'electron/main.ts',
                output: {
                  format: 'cjs',
                  entryFileNames: 'index.cjs'
                }
              }
            }
          }
        },
        preload: {
          input: {
            preload: 'electron/preload.ts'
          },
          vite: {
            appType: 'custom',
            plugins: [vue()],
            build: {
              ssr: true,
              outDir: 'dist-electron/preload',
              target: 'node20',
              sourcemap: 'inline',
              rollupOptions: {
                input: 'electron/preload.ts',
                output: {
                  format: 'cjs',
                  entryFileNames: 'preload.cjs'
                }
              }
            }
          },
          onstart({ reload }) {
            // 预加载变更时，无需重启主进程，直接刷新渲染进程
            reload()
          }
        }
            })
            , renderer() // 开发期为渲染进程注入 Electron/Node 能力，并支持热更新
          ]
        : [])
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


