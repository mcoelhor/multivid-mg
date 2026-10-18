import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Ticket, X, Check } from 'lucide-react'
import { usarOferta, validade } from '../hooks/useOfertas'
import { agoraMV, DIAS, DIAS_NOME, hhmm } from '../lib/horario'

/** Tela cheia "mostre esta tela no balcão": nome do lugar, oferta, hora e um número de uso. */
function TelaUso({ oferta, lugar, onFechar }) {
  const [n, setN] = useState(null)
  const [erro, setErro] = useState(false)
  const a = agoraMV()
  useEffect(() => {
    usarOferta(oferta.id).then(x => (x == null ? setErro(true) : setN(x)))
    const esc = e => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [oferta.id, onFechar])
  return createPortal(
    <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--musgo)] px-6 text-white" role="dialog" aria-modal="true" aria-label="Oferta" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
      <button onClick={onFechar} className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/15" aria-label="Fechar"><X size={22} /></button>
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-[15px] font-bold uppercase tracking-wide text-[var(--broto)]">Mostre esta tela</p>
        <p className="mt-3 text-[18px] text-white/80">{lugar?.name}</p>
        <h2 className="mt-1 text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em]">{oferta.titulo}</h2>
        {oferta.regras && <p className="mt-4 text-[16px] leading-relaxed text-white/85">{oferta.regras}</p>}
        <div className="mt-8 rounded-[var(--raio)] bg-white/10 p-5">
          {erro ? (
            <p className="text-[16px] font-semibold">Esta oferta encerrou.</p>
          ) : (
            <>
              <p className="text-[14px] text-white/70">{DIAS_NOME[DIAS[a.dia]]}, <span className="num">{hhmm(a.min)}</span> · válida {validade(oferta)}</p>
              <p className="num mt-2 text-[40px] font-extrabold leading-none tracking-[0.06em]">{n == null ? '······' : `MV-${String(n).padStart(4, '0')}`}</p>
              <p className="mt-2 flex items-center gap-1.5 text-[14px] text-white/70"><Check size={15} />Uso registrado no Monte Verde MG</p>
            </>
          )}
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-white/60">A oferta é do estabelecimento, que decide as condições. O guia só registra o uso.</p>
    </div>,
    document.body,
  )
}

/** Cartão de oferta: usado na página do lugar, na home e na lista de ofertas. */
export function CartaoOferta({ oferta, lugar, mostrarLugar = false, compacto = false }) {
  const [usar, setUsar] = useState(false)
  return (
    <div className={`rounded-[var(--raio)] bg-[var(--papel)] ${compacto ? 'p-4' : 'p-5'}`} style={{ boxShadow: 'inset 0 0 0 2px var(--broto)' }}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--broto)] text-[var(--araucaria)]"><Ticket size={19} /></span>
        <div className="min-w-0 flex-1">
          {mostrarLugar && lugar && <Link to={`/estabelecimento/${lugar.slug}`} className="block truncate text-[14px] font-bold text-[var(--musgo)]">{lugar.name}</Link>}
          <p className={`font-extrabold leading-tight tracking-[-0.02em] ${compacto ? 'text-[17px]' : 'text-[19px]'}`}>{oferta.titulo}</p>
          {oferta.regras && !compacto && <p className="mt-1 text-[14px] leading-snug text-[var(--leve)]">{oferta.regras}</p>}
          <p className="mt-1 text-[13px] text-[var(--leve)]">Válida {validade(oferta)} · mostre a tela no balcão</p>
        </div>
      </div>
      <button onClick={() => setUsar(true)} className="botao botao-pri mt-3 h-11 min-h-0 w-full text-[15px]">Usar oferta</button>
      {usar && <TelaUso oferta={oferta} lugar={lugar} onFechar={() => setUsar(false)} />}
    </div>
  )
}
