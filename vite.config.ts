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
        '/api/pmcc/v1/auth': {
          target: 'https://office.uds.com.vn',
          changeOrigin: true,
          secure: false,
        },

        '/api/pmcc/v1/profiles': {
          target: 'https://office.uds.com.vn',
          changeOrigin: true,
          secure: false,
        },

        '/api/pmcc/v1/employees': {
          target: 'https://office.uds.com.vn',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['content-type'] = 'application/json; charset=utf-8';
            });
          },
        },

        '/api/pmcc/v1/dashboard': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/dashboard', '/api/dashboard'),
        },

        '/api/pmcc/v1/tasks': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/tasks', '/api/tasks'),
        },

        '/api/pmcc/v1/projects': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/projects', '/api/projects'),
        },

        '/api/pmcc/v1/users': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/users', '/api/users'),
        },

        '/api/pmcc/v1/type-tasks': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/type-tasks', '/api/type-tasks'),
        },

        '/api/pmcc/v1/task-groups': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/task-groups', '/api/task-groups'),
        },

        '/api/pmcc/v1/history': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/history', '/api/history'),
        },

        '/api/pmcc/v1/companies': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/companies', '/api/companies'),
        },

        '/api/pmcc/v1/project-details': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/project-details', '/api/project-details'),
        },

        '/api/pmcc/v1/task-details': {
          target: localBeUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace('/api/pmcc/v1/task-details', '/api/task-details'),
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
