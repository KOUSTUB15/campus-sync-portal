import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/college/',
  server: {
    port: 5171,
    strictPort: true,
    open: false,
  },
});
