import { defineConfig, presetAttributify, presetIcons, presetMini } from 'unocss'

export default defineConfig({
  presets: [
    presetMini({ dark: 'class' }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  theme: {
    colors: {
      primary: {
        50: '#edf5ff',
        100: '#d0e2ff',
        200: '#a6c8ff',
        300: '#78a9ff',
        400: '#4589ff',
        500: '#0f62fe',
        600: '#0043ce',
        700: '#002d9c',
        800: '#001d6c',
        900: '#001141',
      },
      success: '#198038',
      warning: '#f1c21b',
      danger: '#da1e28',
    },
  },
  shortcuts: {
    btn: 'min-h-[44px] px-5 py-2.5 font-body font-medium transition-all duration-150 cursor-pointer select-none active:opacity-80 border-none outline-none',
  },
})
