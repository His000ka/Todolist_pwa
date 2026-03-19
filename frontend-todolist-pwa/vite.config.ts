import { defineConfig } from 'vite'
import react from '@vitejs/react-refresh'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // C'est CA qui fait la magie
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        "name": "TodoList PWA",
        "short_name": "Todo",
        "start_url": ".",
        "display": "standalone",
        "background_color": "#0f172a",
        "theme_color": "#0f172a",
        "icons": [
            {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
            },
            {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png"
            }
        ]
      }
    })
  ]
})