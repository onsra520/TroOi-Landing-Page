import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/TroOi-Landing-Page/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
