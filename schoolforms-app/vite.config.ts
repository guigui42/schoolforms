import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'mantine': ['@mantine/core', '@mantine/hooks', '@mantine/form'],
          'pdf': ['pdf-lib'],
          'router': ['react-router-dom'],
          'store': ['zustand'],
        },
      },
    },
  },
});
