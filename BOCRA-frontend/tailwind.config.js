/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bocra: {
          // Primary navy background
          navy:  '#0D1F3C',
          // Four brand dots from the logo
          teal:  '#1A7F79',
          green: '#2D6A2D',
          red:   '#7A1E2E',
          gold:  '#F0B429',
          // Supporting
          blue:  '#1A56DB',
          sky:   '#3B82F6',
          cyan:  '#06B6D4',
          light: '#F0F7FF',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card:     '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-md':'0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)',
        'card-lg':'0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0', transform: 'translateY(8px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-down': { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'pulse-dot':  { '0%,100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.4)', opacity: '0.7' } },
        'float':      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        'fade-in':    'fade-in 0.3s ease-out both',
        'slide-down': 'slide-down 0.2s ease-out both',
        'pulse-dot':  'pulse-dot 1.5s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      screens: { xs: '480px' },
    },
  },
  plugins: [],
}
