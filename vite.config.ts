import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':   ['react', 'react-dom'],
          'motion-vendor':  ['framer-motion'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'gemini-vendor':  ['@google/generative-ai'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
