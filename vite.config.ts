import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron'
import electronRenderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['better-sqlite3'],
            },
          },
        },
        onstart(args) {
          console.log('🚀 Starting Electron...')
          // Start Electron with explicit spawn args
          args.startup(['.']).catch((err: Error) => {
            console.error('Failed to start Electron:', err)
          })
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          console.log('🔄 Reloading preload...')
          args.reload()
        },
      },
    ]),
    electronRenderer(),
  ],
})
