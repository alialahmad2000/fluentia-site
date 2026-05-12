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

// Capture affiliate ref code on first load
captureRefFromUrl()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
