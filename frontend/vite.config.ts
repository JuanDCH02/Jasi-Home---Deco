import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { prerender } from './vite-plugin-prerender'

export default defineConfig({
  plugins: [react(), tailwindcss(), prerender()],
})
