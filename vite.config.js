import { defineConfig } from 'vite';

export default defineConfig({
  // Root directory where index.html is located
  root: '.',

  // Public directory for static assets
  publicDir: 'public',

  // Build output directory
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Optimize dependencies
    rollupOptions: {
      output: {
        manualChunks: {
          'supabase': ['@supabase/supabase-js']
        }
      }
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true
  },

  // Preview server configuration
  preview: {
    port: 8000
  }
});
