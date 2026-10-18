import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { EPOCAS, NOME_MES } from '../data/epoca'

/** O que está na época, mês a mês: pinhão, hortênsias, mar de nuvens, geada. */
export function Epoca() {
  const mes = new Date().getMonth()
  const ordem = [...EPOCAS].sort((a, b) => (b.meses.includes(mes) ? 1 : 0) - (a.meses.includes(mes) ? 1 : 0))
  return (
    <Layout title="Na época" subtitle={`O que ${NOME_MES[mes]} tem de melhor`} showBack>
      <div className="space-y-3 px-5">
        {ordem.map((e, k) => {
          const agora = e.meses.includes(mes)
          return (
            <article key={e.id} className={`entra overflow-hidden rounded-[var(--raio)] bg-[var(--papel)] ${agora ? '' : 'opacity-80'}`} style={{ '--i': k }}>
              <img src={e.foto.p} alt={e.foto.legenda} loading={k < 2 ? 'eager' : 'lazy'} className="aspect-[16/8] w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">{e.nome}</h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[13px] font-bold ${agora ? 'bg-[var(--broto)] text-[var(--araucaria)]' : 'bg-[var(--nevoa)] text-[var(--leve)]'}`}>{agora ? 'agora' : e.meses.map(m => NOME_MES[m].slice(0, 3)).join(', ')}</span>
                </div>
                <p className="mt-2 text-[16px] leading-relaxed">{e.resumo}</p>
                <p className="mt-2 text-[15px] leading-snug text-[var(--leve)]">Dica: {e.dica}</p>
                <Link to={`/busca?q=${encodeURIComponent(e.busca)}`} className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[16px] font-bold text-[var(--musgo)]">Ver no guia <ArrowRight size={17} /></Link>
              </div>
            </article>
          )
        })}
      </div>
    </Layout>
  )
}
