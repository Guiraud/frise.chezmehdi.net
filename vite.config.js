import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    fs: {
      // Allow serving files from the project root and public directory
      allow: [
        path.resolve(process.cwd(), '.'),
        path.resolve(process.cwd(), 'public'),
        // Add parent directory
        path.resolve(process.cwd(), '..')
      ]
    },
    // Configure CORS to allow all origins in development
    cors: true,
    // Configure proxy if needed for API requests
    proxy: {
      // Example:
      // '/api': {
      //   target: 'http://localhost:3000',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, '')
      // }
    }
  },
  // For production build
  build: {
    // Ensure static assets are properly handled
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  // Custom middleware to handle the URL parameter and static files
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, 'http://localhost')
      
      // Allow CSV files to be served properly
      if (url.pathname.endsWith('.csv')) {
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Access-Control-Allow-Origin', '*')
      }
      
      // Allow requests to the root path with any query parameters
      if (url.pathname === '/' || url.pathname.endsWith('.csv') || url.pathname.startsWith('/assets/')) {
        return next()
      }
      
      // Allow all other requests to continue normally
      next()
    })
  }
})