/**
 * entry-server — build-time prerender of one route to HTML.
 *
 * Called by scripts/prerender-meta.mjs for every route it writes. Renders the
 * SAME tree the browser renders (StrictMode › HelmetProvider › router › AppShell)
 * and waits for every lazy route chunk (onAllReady), so the HTML is complete.
 * The browser then hydrates it (src/main.jsx) instead of rendering from scratch.
 */
import React from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Writable } from 'node:stream'
import { AppShell } from './App.jsx'

export function render(url) {
  return new Promise((resolve, reject) => {
    const helmetContext = {}
    const chunks = []
    let failed = null
    const sink = new Writable({
      write(chunk, _enc, cb) { chunks.push(Buffer.from(chunk)); cb() },
    })
    sink.on('finish', () => {
      if (failed) return reject(failed)
      // Concatenate bytes before decoding: an Arabic character can straddle chunks.
      resolve({ html: Buffer.concat(chunks).toString('utf8'), helmet: helmetContext.helmet })
    })
    const { pipe, abort } = renderToPipeableStream(
      <React.StrictMode>
        <HelmetProvider context={helmetContext}>
          <StaticRouter location={url}>
            <AppShell />
          </StaticRouter>
        </HelmetProvider>
      </React.StrictMode>,
      {
        onAllReady() { pipe(sink) },
        onShellError(err) { reject(err) },
        onError(err) { failed = failed || err },
      },
    )
    setTimeout(() => abort(new Error(`prerender timeout: ${url}`)), 20000).unref()
  })
}
