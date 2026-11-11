import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // 5173 dipakai rental. strictPort: gagal jelas, tidak pindah diam-diam.
    port: 5174,
    strictPort: true,
    // Panggilan /api diteruskan ke API inventory saat pengembangan
    proxy: { '/api': 'http://localhost:3100' },
  },
})
