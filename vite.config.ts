import babel from '@rolldown/plugin-babel'
import UnoCSS from '@unocss/vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/ScaleTrack/',
  plugins: [UnoCSS(), react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
