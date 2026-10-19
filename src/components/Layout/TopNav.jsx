import { Link, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'

const LINKS = [
  ['Início', '/'],
  ['Explorar', '/categorias'],
  ['Roteiro', '/roteiro'],
  ['Ofertas', '/ofertas'],
  ['Eventos', '/eventos'],
  ['Úteis', '/uteis'],
  ['Mapa', '/mapa'],
  ['Salvos', '/favoritos'],
]

/** Menu do computador: barra fixa no topo. No celular quem navega é a barra de baixo. */
export function TopNav() {
  const { pathname } = useLocation()
  const ativo = p => (p === '/' ? pathname === '/' : pathname.startsWith(p) || (p === '/categorias' && pathname.startsWith('/categoria/')))
  return (
    <nav className="sticky top-0 z-50 hidden h-16 bg-[var(--araucaria)] text-white lg:block" aria-label="Menu">
      <div className="mx-auto flex h-full max-w-[1180px] items-center gap-5 px-8">
        <Link to="/" className="shrink-0 text-[22px] font-extrabold tracking-[-0.035em]">Monte Verde<span className="text-[var(--broto)]"> MG</span></Link>
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          {LINKS.map(([t, to]) => (
            <Link key={to} to={to} aria-current={ativo(to) ? 'page' : undefined}
              className={`rounded-full px-3 py-2 text-[15px] font-semibold transition-colors duration-150 ${ativo(to) ? 'bg-white/12 text-white' : 'text-white/70 hover:text-white'}`}>{t}</Link>
          ))}
        </div>
        <Link to="/busca" aria-label="Buscar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-150 hover:bg-white/20"><Search size={18} /></Link>
        <Link to="/meu-negocio" className="shrink-0 text-[14px] font-semibold text-white/70 transition-colors duration-150 hover:text-white">Meu negócio</Link>
        <Link to="/anuncie" className="botao botao-broto h-10 min-h-0 shrink-0 px-4 text-[14px]">Anuncie</Link>
      </div>
    </nav>
  )
}
