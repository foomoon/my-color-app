import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { createVuePlugin as vue2 } from 'vite-plugin-vue2'


// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: './ssl/light-mapper-app.key',
      cert: './ssl/light-mapper-app.crt',
    },
  },
  plugins: [
    vue2({
      jsx: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      vue: 'vue/dist/vue.esm.js',
    },
  },
  build: {
    brotliSize: false, // unsupported in StackBlitz
  },
})
