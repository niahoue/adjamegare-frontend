import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    global: 'globalThis'
  },
  esbuild: {
    // Supprimer console.* et debugger uniquement en production
    drop: mode === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    target: 'es2018', // modern JS, compatible et plus léger
    sourcemap: false, // désactiver les source maps en prod
    cssCodeSplit: true, // séparer le CSS par bundle → charge plus vite
    minify: 'esbuild', // minification rapide et efficace
    rollupOptions: {
      output: {
        // Cache-busting avec hash
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Découpe le JS en chunks (code splitting)
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          vendor: ['axios', 'lodash'] // ajoute ici tes grosses libs
        }
      }
    }
  }
}))
