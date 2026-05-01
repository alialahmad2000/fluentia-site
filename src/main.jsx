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

// Premium design tokens
import './styles/fresh-tokens.css';
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
