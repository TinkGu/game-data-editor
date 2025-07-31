import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'development' ? '/' : '/game-data-editor/',
  plugins: [
    react(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'TagTag',
    //     short_name: 'TagTag',
    //     description: 'TagTag',
    //     theme_color: '#1967d2',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     start_url: '/game-data-editor/',
    //     lang: 'zh-CN',
    //     icons: [
    //       {
    //         src: 'icons-48.png',
    //         sizes: '48x48',
    //       },
    //       {
    //         src: 'icons-144.png',
    //         sizes: '72x72 96x96 128x128 144x144',
    //         purpose: 'maskable',
    //       },
    //       {
    //         src: 'icons-512.png',
    //         sizes: '152x152 192x192 256x256 384x384 512x512',
    //         purpose: 'maskable',
    //       },
    //     ],
    //   },
    // }),
  ],
  root: path.resolve(__dirname),
  resolve: {
    alias: [{ find: 'app', replacement: path.resolve(__dirname, 'src') }],
  },
});
