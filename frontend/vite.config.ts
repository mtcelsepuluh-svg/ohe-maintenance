import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Disable caching for API responses
            proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
            proxyRes.headers['Pragma'] = 'no-cache';
            proxyRes.headers['Expires'] = '0';
          });
        }
      },
    },
  },
})
