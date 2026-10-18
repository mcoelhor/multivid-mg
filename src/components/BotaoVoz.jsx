import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'

const Rec = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

/** Busca por voz: aparece só onde o navegador reconhece fala (Chrome, Safari). */
export function BotaoVoz({ onTexto, className = '', escuro = false }) {
  const [ouvindo, setOuvindo] = useState(false)
  const rec = useRef(null)
  useEffect(() => () => rec.current?.abort?.(), [])
  if (!Rec) return null
  const iniciar = () => {
    if (ouvindo) { rec.current?.stop(); return }
    const r = new Rec()
    r.lang = 'pt-BR'; r.interimResults = false; r.maxAlternatives = 1
    r.onresult = e => { const t = e.results[0]?.[0]?.transcript; if (t) onTexto(t.trim()) }
    r.onend = () => setOuvindo(false)
    r.onerror = () => setOuvindo(false)
    rec.current = r
    try { r.start(); setOuvindo(true) } catch { setOuvindo(false) }
  }
  return (
    <button type="button" onClick={iniciar} aria-pressed={ouvindo} aria-label={ouvindo ? 'Parar de ouvir' : 'Buscar por voz'}
      className={`pressiona flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ouvindo ? 'bg-[var(--sos)] text-white' : escuro ? 'text-white/70' : 'text-[var(--leve)]'} ${className}`}>
      <Mic size={19} className={ouvindo ? 'respira' : ''} />
    </button>
  )
}
