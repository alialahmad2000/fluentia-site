import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { captureRefFromUrl } from './utils/affiliateTracking'

// Capture affiliate ref code on first load
captureRefFromUrl()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
