import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Revelação ao rolar: marca .revela/.revela-foto como vistos quando entram na tela (uma vez só).
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  : null
const observa = raiz => raiz.querySelectorAll?.('.revela:not(.visto), .revela-foto:not(.visto)').forEach(el => (io ? io.observe(el) : el.classList.add('visto')))
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) { if (n.matches('.revela, .revela-foto')) io ? io.observe(n) : n.classList.add('visto'); observa(n) } })))
  .observe(document.getElementById('root'), { childList: true, subtree: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
