import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // KaTeX is huge (~300kb) and only needed inside test screens
            if (id.includes('katex')) {
              return 'vendor-katex';
            }
            // Canvas confetti only needed on test submit / results
            if (id.includes('canvas-confetti')) {
              return 'vendor-confetti';
            }
            // All essential core runtime dependencies consolidated
            return 'vendor-core';
          }
        },
      },
    },
  },
});
