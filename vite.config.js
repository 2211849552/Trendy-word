import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function rewriteSessionCookies(proxy) {
  proxy.on('proxyRes', (proxyRes) => {
    const cookies = proxyRes.headers['set-cookie']
    if (!cookies) return

    proxyRes.headers['set-cookie'] = cookies.map((cookie) =>
      cookie
        .replace(/;\s*Domain=[^;]*/gi, '')
        .replace(/;\s*Secure/gi, '')
        .replace(/SameSite=None/gi, 'SameSite=Lax'),
    )
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 60000,
        configure: rewriteSessionCookies,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 60000,
        configure: rewriteSessionCookies,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 60000,
        configure: rewriteSessionCookies,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        timeout: 60000,
        configure: rewriteSessionCookies,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
