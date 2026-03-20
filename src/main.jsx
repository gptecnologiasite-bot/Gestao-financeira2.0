import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { FinanceProvider } from './contexts/FinanceContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { BrandingProvider } from './contexts/BrandingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrandingProvider>
      <ThemeProvider>
        <AuthProvider>
          <FinanceProvider>
            <App />
          </FinanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrandingProvider>
  </StrictMode>,
)
