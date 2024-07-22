import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'service-worker.js',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      workbox: {
        cleanupOutdatedCaches: false,
        sourcemap: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'AI 드리-몽',
        short_name: '드리-몽',
        description: 'AI-based dream interpretation app',
        theme_color: '#ffffff',
        icons: [
          {
            src: "/drea-mong_192px.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "/drea-mong_512px.png",
            type: "image/png",
            sizes: "512x512",
          },
        ]
      }
    })
  ]
})