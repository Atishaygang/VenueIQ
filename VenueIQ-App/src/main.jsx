import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VenueProvider } from './engine/VenueContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VenueProvider>
      <App />
    </VenueProvider>
  </StrictMode>,
)
