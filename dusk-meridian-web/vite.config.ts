import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_CLIENT_PORT) || 8080,
      host: true,
      strictPort: true, // Don't try other ports if 8080 is in use
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  }
})
