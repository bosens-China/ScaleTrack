import babel from '@rolldown/plugin-babel'
import UnoCSS from '@unocss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8')) as {
  version: string
}

export default defineConfig({
  base: '/ScaleTrack/',
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    UnoCSS(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'ScaleTrack - 体重与运动追踪',
        short_name: 'ScaleTrack',
        description: '本地体重、BMI 与运动节律追踪应用，支持离线记录和趋势查看。',
        start_url: '/ScaleTrack/',
        scope: '/ScaleTrack/',
        display: 'standalone',
        background_color: '#0d100e',
        theme_color: '#171c18',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/ScaleTrack/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
