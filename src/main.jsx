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
