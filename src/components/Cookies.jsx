import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { consentimento, guardarConsentimento, carregar } from '../lib/marketing'
import { supabase } from '../lib/supabase'

/** Aviso de cookies (LGPD): só aparece se o painel tiver pixel configurado; some depois da escolha. */
export function Cookies() {
  const [mostrar, setMostrar] = useState(false)
  useEffect(() => {
    const c = consentimento()
    if (c === 'tudo') { carregar(); return }
    if (c === 'essencial') return
    // Sem pixel configurado não há o que pedir
    supabase.from('config').select('valor').in('chave', ['meta_pixel_id', 'google_tag_id']).then(({ data }) => {
      if ((data || []).some(x => (x.valor || '').trim())) setMostrar(true)
    })
  }, [])
  if (!mostrar) return null
  const escolher = v => { guardarConsentimento(v); setMostrar(false) }
  return (
    <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[65] mx-auto max-w-[480px] px-3 lg:bottom-6" role="dialog" aria-label="Cookies">
      <div className="rounded-[var(--raio)] bg-[var(--araucaria)] p-4 text-white" style={{ boxShadow: '0 12px 32px -12px rgba(0,0,0,.5)' }}>
        <p className="text-[14px] leading-snug">Usamos cookies para medir e mostrar o guia a quem está em Monte Verde. Você escolhe. <Link to="/privacidade" className="underline">Saiba mais</Link>.</p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => escolher('essencial')} className="botao h-10 min-h-0 flex-1 bg-white/12 text-[14px] text-white">Só o necessário</button>
          <button onClick={() => escolher('tudo')} className="botao botao-broto h-10 min-h-0 flex-1 text-[14px]">Aceitar</button>
        </div>
      </div>
    </div>
  )
}
