import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':           fileURLToPath(new URL('./src',            import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages':      fileURLToPath(new URL('./src/pages',      import.meta.url)),
      '@features':   fileURLToPath(new URL('./src/features',   import.meta.url)),
      '@hooks':      fileURLToPath(new URL('./src/hooks',      import.meta.url)),
      '@services':   fileURLToPath(new URL('./src/services',   import.meta.url)),
      '@store':      fileURLToPath(new URL('./src/store',      import.meta.url)),
      '@types':      fileURLToPath(new URL('./src/types',      import.meta.url)),
      '@utils':      fileURLToPath(new URL('./src/utils',      import.meta.url)),
      '@locales':    fileURLToPath(new URL('./src/locales',    import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target:       'http://localhost:4000',
        changeOrigin: true,
        secure:       false,
      },
    },
  },
  build: {
    outDir:    'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query:  ['@tanstack/react-query'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          radix: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
  },
  test: {
    globals:     true,
    environment: 'jsdom',
    setupFiles:  './src/test/setup.ts',
    css:         true,
  },
})