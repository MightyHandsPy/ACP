import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages deployment, base must match the repo name.
// For custom domain or other hosts, set base to '/'
const base = process.env.GITHUB_ACTIONS ? '/ACP/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
