import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function fixViewport() {
  document.documentElement.style.height = window.innerHeight + "px";
  document.body.style.height = window.innerHeight + "px";
}

// au load
window.addEventListener("load", fixViewport);
window.addEventListener("resize", fixViewport);
window.addEventListener("orientationchange", fixViewport);

fixViewport();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
