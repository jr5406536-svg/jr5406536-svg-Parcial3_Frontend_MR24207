import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const pdfjs = fileURLToPath(new URL('./node_modules/pdfjs-dist/build/pdf.mjs', import.meta.url))
const pdfjsWorker = fileURLToPath(new URL('./node_modules/pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: 'pdfjs-dist/build/pdf.worker.min.mjs', replacement: pdfjsWorker },
      { find: /^pdfjs-dist$/, replacement: pdfjs },
    ],
  },
})
