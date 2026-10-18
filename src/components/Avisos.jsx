import { Link } from 'react-router-dom'
import { Megaphone, TriangleAlert, CalendarDays, ArrowRight } from 'lucide-react'
import { useAvisos } from '../hooks/useAvisos'

const ICONE = { info: Megaphone, alerta: TriangleAlert, evento: CalendarDays }
const COR = { info: 'bg-[var(--araucaria)] text-white', alerta: 'bg-[#f3e8cc] text-[#5a4206]', evento: 'bg-[var(--broto)] text-[var(--araucaria)]' }

/** Faixa de avisos da vila, no topo da home. Some quando não há aviso ativo. */
export function Avisos() {
  const avisos = useAvisos()
  if (!avisos.length) return null
  return (
    <div className="space-y-px" role="region" aria-label="Avisos">
      {avisos.map(a => {
        const I = ICONE[a.tipo] || Megaphone
        const externo = a.link && /^https?:/.test(a.link)
        const conteudo = (
          <>
            <I size={17} className="mt-0.5 shrink-0" />
            <span className="min-w-0 flex-1 text-[14px] font-semibold leading-snug">{a.texto}</span>
            {a.link && <ArrowRight size={16} className="shrink-0" />}
          </>
        )
        const cls = `flex items-start gap-2.5 px-5 py-3 ${COR[a.tipo] || COR.info}`
        if (!a.link) return <div key={a.id} className={cls}>{conteudo}</div>
        return externo
          ? <a key={a.id} href={a.link} target="_blank" rel="noopener noreferrer" className={cls}>{conteudo}</a>
          : <Link key={a.id} to={a.link} className={cls}>{conteudo}</Link>
      })}
    </div>
  )
}
