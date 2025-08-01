import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { QueryProvider } from './components/QueryProvider'
import { ThemeProvider } from './context/theme-provider'
import { BrowserRouter } from 'react-router-dom'  // <-- import this




ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>

      <BrowserRouter >
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <QueryProvider>
            
            <App />
          </QueryProvider>
        </ThemeProvider>
      </BrowserRouter>

  </React.StrictMode>
)
