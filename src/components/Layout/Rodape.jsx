import { Link } from 'react-router-dom'
import { Siren, ArrowRight } from 'lucide-react'

const LINKS = [
  ['Anuncie seu negócio', '/anuncie'],
  ['Eventos', '/eventos'],
  ['Todas as categorias', '/categorias'],
  ['Corrigir uma informação', '/mais#corrigir'],
  ['Instalar o app', '/mais'],
  ['Créditos das fotos', '/creditos'],
]

/** Fecho de todas as páginas: emergência discreta, links e o nome em tamanho de pôster. */
export function Rodape() {
  return (
    <footer className="mt-16 overflow-hidden bg-[var(--araucaria)] px-5 pt-8 text-white">
      <Link to="/sos" className="pressiona flex items-center gap-3 rounded-[var(--raio)] bg-[var(--sos)] px-5 py-4">
        <Siren size={22} className="shrink-0" />
        <span className="flex-1">
          <span className="block text-[17px] font-bold leading-tight">Precisa de ajuda agora?</span>
          <span className="num block text-[14px] text-white/85">Farmácia, pronto-socorro, guincho · 190 · 192 · 193</span>
        </span>
        <ArrowRight size={20} className="shrink-0" />
      </Link>

      <nav className="mt-10 grid grid-cols-2 gap-x-4 gap-y-3" aria-label="Links do rodapé">
        {LINKS.map(([t, to]) => (
          <Link key={to} to={to} className="text-[15px] text-white/80 transition-colors duration-150 hover:text-white">{t}</Link>
        ))}
      </nav>

      <p className="mt-12 max-w-[30ch] text-[15px] leading-snug text-white/70">
        Guia local de Monte Verde e Camanducaia, MG. Parceiros pagos são sempre identificados.
      </p>
      <p className="display -mb-[0.16em] mt-6 select-none text-[22vw] text-[var(--broto)] min-[480px]:text-[104px]" aria-hidden="true">Monte Verde</p>
    </footer>
  )
}
