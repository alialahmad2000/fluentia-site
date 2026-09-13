/**
 * Server build used ONLY at build time by scripts/prerender-meta.mjs to render
 * each prerendered route to HTML (so crawlers that don't run JavaScript — and
 * Google's first pass — see the page's text, not an empty #root).
 *
 * Deliberately separate from vite.config.js: the client build (and its
 * multi-page inputs, e.g. tour.html) stays exactly as it is.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    ssr: 'src/entry-server.jsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: { input: 'src/entry-server.jsx' },
  },
  ssr: {
    // Bundle these rather than letting Node resolve them: their ESM/CJS entry
    // points trip Node's resolver when imported from a Vite-built SSR module.
    noExternal: ['react-helmet-async', 'framer-motion', 'lucide-react'],
  },
})
