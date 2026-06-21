import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        classroom: resolve(__dirname, 'src/classroom/index.html'),
        sat: resolve(__dirname, 'src/exams/sat/index.html'),
        ielts: resolve(__dirname, 'src/exams/ielts/index.html')
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: ['three', 'pixi.js', '@mlc-ai/web-llm']
  }
})
