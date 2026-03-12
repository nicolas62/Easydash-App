import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        headers: {
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
        }
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            short_name: "EasyDash",
            name: "EasyDash",
            icons: [
              {
                src: "/logo.png",
                type: "image/png",
                sizes: "192x192"
              },
              {
                src: "/logo.png",
                type: "image/png",
                sizes: "512x512"
              }
            ],
            start_url: ".",
            display: "standalone",
            theme_color: "#121212",
            background_color: "#121212",
            orientation: "portrait"
          },
          workbox: {
            cleanupOutdatedCaches: true,
            navigateFallback: '/index.html',
            navigateFallbackDenylist: [/^\/core\/api/, /^\/core\/jeeApi\.php/],
            runtimeCaching: [
              {
                urlPattern: ({ request, url }) => {
                  return request.method === 'POST' || 
                         url.hostname.includes('homenico.ddns.net') ||
                         url.pathname.includes('jeeApi');
                },
                handler: 'NetworkOnly'
              },
              {
                urlPattern: ({ request, url }) => {
                  return request.destination === 'script' ||
                         request.destination === 'style' ||
                         request.destination === 'image' ||
                         request.destination === 'font' ||
                         url.pathname.endsWith('.html');
                },
                handler: 'StaleWhileRevalidate'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
