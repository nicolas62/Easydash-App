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
          strategies: 'injectManifest',
          srcDir: 'src',
          filename: 'sw.ts',
          injectManifest: {
            // Exclude large files (logo.png is 6 MB — too large to precache)
            globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
          },
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
