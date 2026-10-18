import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'

const ATALHOS = [['Início', '/'], ['Explorar', '/categorias'], ['Roteiro', '/roteiro'], ['Úteis', '/uteis']]

/** Página 404: diz o que houve e oferece busca e atalhos, em vez de voltar à home em silêncio. */
export function NaoEncontrada() {
  const navigate = useNavigate()
  return (
    <Layout title="Página não encontrada" showBack>
      <div className="px-5">
        <p className="text-[17px] leading-relaxed text-[var(--leve)]">O endereço que você abriu não existe ou mudou. Procure o que precisa ou use um atalho.</p>
        <form onSubmit={e => { e.preventDefault(); const v = e.currentTarget.q.value.trim(); if (v) navigate(`/busca?q=${encodeURIComponent(v)}`) }} className="mt-5" role="search">
          <div className="relative">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--leve)]" />
            <input name="q" type="search" enterKeyHint="search" placeholder="fondue, farmácia, trilha…" aria-label="Buscar" className="h-14 w-full rounded-full bg-[var(--papel)] pl-12 pr-5 text-[16px]" />
          </div>
        </form>
        <ul className="mt-6">
          {ATALHOS.map(([t, to]) => (
            <li key={to}><Link to={to} className="flex min-h-12 items-center justify-between py-2 text-[22px] font-bold tracking-[-0.02em]">{t}<ArrowRight size={20} className="text-[var(--musgo)]" /></Link></li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}
