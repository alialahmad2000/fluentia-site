// Tajawal — Arabic display + body
import '@fontsource/tajawal/300.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/tajawal/800.css';
import '@fontsource/tajawal/900.css';

// Readex Pro — Arabic body fallback + variable axis
import '@fontsource-variable/readex-pro';

// Inter — Latin numbers + technical labels
import '@fontsource-variable/inter';

// New fonts for /v2 landing (Modern Cinematic)
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "@fontsource/tajawal/900.css";
import "@fontsource/readex-pro/300.css";
import "@fontsource/readex-pro/400.css";
import "@fontsource/readex-pro/500.css";
import "@fontsource/readex-pro/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// V1 landing fonts (/v1 Obsidian Azure) — Alexandria display
import "@fontsource/alexandria/300.css";
import "@fontsource/alexandria/500.css";
import "@fontsource/alexandria/600.css";
import "@fontsource/alexandria/700.css";
import "@fontsource/alexandria/800.css";
import "@fontsource/aref-ruqaa/400.css"; // founder signature only

// Atelier landing fonts (/atelier) — Cairo headings + Cormorant Garamond serif
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";

// Landing design tokens
import './styles/landing-tokens.css';

// Premium design tokens (deprecated — kept for legacy /v1 route)
import './styles/fresh-tokens.deprecated.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './styles/typography.css'
import App from './App.jsx'
import { captureRefFromUrl } from './utils/affiliateTracking'
import { captureAttribution } from './lib/attribution'
import { installWhatsAppClickTracking } from './lib/track'

// Capture affiliate ref code on first load
captureRefFromUrl()
// Remember where this visitor came from before any navigation drops the query
// string, and count every WhatsApp tap (the site's main conversion path).
captureAttribution()
installWhatsAppClickTracking()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
