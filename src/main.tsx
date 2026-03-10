import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (err) {
  console.error('Fatal init error:', err);
  // Show minimal fallback UI if even React fails to mount
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a2e;color:white;font-family:sans-serif;text-align:center;padding:2rem">
        <div style="font-size:4rem;margin-bottom:1rem">🐷</div>
        <h1 style="font-size:1.3rem;color:#fbbf24">KidCapital couldn't start</h1>
        <p style="opacity:0.6;margin-top:0.5rem">Please restart the app</p>
      </div>
    `;
  }
}
