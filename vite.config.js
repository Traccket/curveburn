import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vendors en chunks separados: React casi nunca cambia entre deploys,
        // así el navegador lo mantiene en caché aunque cambie el código propio.
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-gsap': ['gsap'],
        },
      },
    },
  },
})
