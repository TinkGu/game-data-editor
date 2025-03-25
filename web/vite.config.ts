import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'development' ? '/' : '/game-data-editor/',
  plugins: [react()],
  root: path.resolve(__dirname),
  resolve: {
    alias: [
      { find: 'app', replacement: path.resolve(__dirname, 'src') },
      {
        find: 'xeno',
        replacement: path.resolve(__dirname, '../xeno'),
      },
    ],
  },
});
