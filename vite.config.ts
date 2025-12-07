
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: Para GitHub Pages, isso deve ser o nome do seu repositório entre barras
  base: "/memorial-os/",
})
