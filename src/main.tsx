import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { purgeUnownedAttempts } from './lib/attemptStorage'

// Saved attempts are now scoped to the account that created them. Records from
// the older, unscoped scheme record no owner, so they would be readable by
// whoever signs in next; they are dropped before anything can read them.
purgeUnownedAttempts()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
