import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'ChatbotWidget',
      fileName: (format) => `widget-v4.js`,
      formats: ['iife'], // IIFE format allows it to run directly in the browser
    },
    rollupOptions: {
      output: {
        // Prevent Vite from creating multiple chunks
        inlineDynamicImports: true,
      }
    }
  }
});
