import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The console calls its backend (ai-damage-assessment-service/superadmin-service)
// at the same-origin path /api. In dev/preview Vite proxies it to the local
// service; in production nginx does the same (see DEPLOYMENT.md).
const apiProxy = {
    '/api': { target: process.env.SUPERADMIN_API_TARGET || 'http://127.0.0.1:8030', changeOrigin: false },
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5180,
        host: true,
        proxy: apiProxy,
    },
    preview: {
        port: 4180,
        proxy: apiProxy,
    },
})
