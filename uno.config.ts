import { defineConfig, presetAttributify, presetIcons, presetMini, presetWebFonts } from 'unocss'

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
    presetWebFonts({
      fonts: {
        sans: {
          name: 'Plus Jakarta Sans',
          weights: [400, 500, 600, 700, 800],
        },
        body: {
          name: 'DM Sans',
          weights: [400, 500, 600],
        },
        mono: 'JetBrains Mono:400',
      },
    }),
  ],
  theme: {
    colors: {
      primary: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        200: '#99f6e4',
        300: '#5eead4',
        400: '#2dd4bf',
        500: '#14b8a6',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
      },
      accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
      },
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#f43f5e',
      bmi: {
        underweight: '#06b6d4',
        normal: '#10b981',
        overweight: '#f59e0b',
        obese: '#f43f5e',
      },
    },
  },
  shortcuts: {
    btn: 'min-h-[44px] px-5 py-2.5 rounded-2xl font-body font-medium transition-all duration-200 ease-out cursor-pointer select-none active:scale-[0.97] border-none outline-none',
    'btn-primary':
      'btn bg-primary-600 text-white border-none shadow-md shadow-primary-500/20 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
    'btn-outline':
      'btn border border-solid border-[var(--c-border)] text-[var(--c-text)] hover:bg-[var(--c-bg-secondary)] hover:border-[var(--c-text-secondary)]/30',
    card: 'bg-[var(--c-card)] rounded-3xl border border-solid border-[var(--c-border)] shadow-xl shadow-[var(--c-card-shadow)]',
    input:
      'w-full min-h-[44px] px-4 py-3 rounded-2xl border border-solid border-[var(--c-border)] bg-[var(--c-card)] text-[var(--c-text)] font-body placeholder:text-[var(--c-text-secondary)]/30 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/15 transition-all duration-200',
  },
})
