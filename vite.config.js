import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const root = (p) => fileURLToPath(new URL(p, import.meta.url))

// /tour is a second page entry (tour.html) with its own CSS world: the student
// platform's components render there exactly as they do inside the LMS, clear of
// this site's global resets. In production vercel.json rewrites /tour/* to
// tour.html; this does the same for the dev server. Paths with a file extension
// (/tour/unit/cover.webp) are public assets and pass through untouched.
function tourEntryInDev() {
  return {
    name: 'tour-entry-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url || '').split('?')[0]
        if (/^\/tour(\/|$)/.test(path) && !/\.[a-z0-9]+$/i.test(path)) req.url = '/tour.html'
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), tourEntryInDev()],
  build: {
    rollupOptions: {
      input: {
        main: root('./index.html'),
        tour: root('./tour.html'),
      },
    },
  },
})
