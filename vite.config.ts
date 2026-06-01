import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const externalApiUrl = env.VITE_EXTERNAL_API_URL
  const localBeUrl = env.VITE_LOCAL_BE_URL

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
        '/api/auth': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/auth', '/api/auth'),
        },

        '/api/profiles': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/profiles', '/api/users/profile'),
        },

        '/api/employees': {
          target: 'https://office.uds.com.vn',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['content-type'] = 'application/json; charset=utf-8';
            });
          },
        },

        '/api/dashboard': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/dashboard', '/api/dashboard'),
        },

        '/api/tasks': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/tasks', '/api/tasks'),
        },

        '/api/projects': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/projects', '/api/projects'),
        },

        '/api/users': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/users', '/api/users'),
        },

        '/api/type-tasks': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/type-tasks', '/api/type-tasks'),
        },

        '/api/task-groups': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/task-groups', '/api/task-groups'),
        },

        '/api/history': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/history', '/api/history'),
        },

        '/api/companies': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/companies', '/api/companies'),
        },

        '/api/project-details': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/project-details', '/api/project-details'),
        },

        '/api/task-details': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/task-details', '/api/task-details'),
        },

        '/api': {
          target: externalApiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
