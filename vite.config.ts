import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const beUrl = env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [
      react(),
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: 'netlify.toml',
            dest: '.'
          }
        ]
      })
    ],
    server: {
      proxy: {
        // Proxy tất cả /api/* → BE localhost:8080
        '/api': {
          target: beUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
