/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      manifest: {
        name: 'ARQITEKT Hub',
        short_name: 'ARQITEKT',
        description: 'KI-powered Requirements Engineering Framework',
        theme_color: '#FFD700',
        background_color: '#0D1117',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts', 'src/main.tsx'],
    },
  },
  server: {
    port: parseInt(process.env.VITE_PORT || '5173', 10),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.VITE_API_PORT || '3334'}`,
        changeOrigin: true,
      },
      '/ws': {
        target: `ws://localhost:${process.env.VITE_API_PORT || '3334'}`,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          monaco: ['@monaco-editor/react'],
          xterm: ['@xterm/xterm', '@xterm/addon-fit'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
