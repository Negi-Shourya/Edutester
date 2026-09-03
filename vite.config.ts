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
            // Animation runtime: no longer in the first-paint bundle
            // (Navbar/Reveal/Stagger/PageTransition are CSS-only now), so
            // keep it in one shared async chunk for the lazy pages that
            // still use it (Dashboard, Pricing, ChapterTests, ...).
            if (id.includes('motion')) {
              return 'vendor-motion';
            }
            // Supabase client (~100kb+) — shared by auth + lazy pages
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
              return 'vendor-react';
            }
            // All other essential core runtime dependencies consolidated
            return 'vendor-core';
          }
        },
      },
    },
  },
});
