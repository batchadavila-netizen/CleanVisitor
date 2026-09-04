import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { frFR } from '@clerk/localizations';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("La clé VITE_CLERK_PUBLISHABLE_KEY est manquante dans le fichier .env")
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider 
  publishableKey={PUBLISHABLE_KEY} 
  localization={frFR}
  signInFallbackRedirectUrl="/mon-espace"
  signUpFallbackRedirectUrl="/mon-espace"
> 
  <App />
</ClerkProvider>
  </StrictMode>,
)