import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/TroOi-Landing-Page/',
  // Dev: chuyển /TroOi-Landing-Page/api/* sang server Node (npm run server).
  server: {
    proxy: {
      '/TroOi-Landing-Page/api': {
        target: 'http://127.0.0.1:3001',
        rewrite: (path) => path.replace('/TroOi-Landing-Page', ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
