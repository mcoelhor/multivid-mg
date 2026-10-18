import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

/** Cabeçalho das páginas internas: chapado, título grande, sem sombra. */
export function Header({ title, showBack, showSearch, onSearchClick, subtitle, tom = 'claro' }) {
  const navigate = useNavigate()
  const sos = tom === 'sos'
  const escuro = tom === 'escuro' || sos
  const fundo = sos ? 'var(--sos)' : escuro ? 'var(--araucaria)' : 'var(--nevoa)'
  const tinta = escuro ? '#fff' : 'var(--araucaria)'
  const botao = escuro ? 'bg-white/12 text-white' : 'bg-[var(--papel)] text-[var(--araucaria)]'

  return (
    <header className="sticky top-0 z-40 px-5" style={{ background: fundo, color: tinta, paddingTop: 'calc(env(safe-area-inset-top) + 14px)', paddingBottom: 14 }}>
      <div className="flex min-h-11 items-center gap-3">
        {showBack && (
          <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))} className={`pressiona -ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${botao}`} aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[24px] font-extrabold leading-tight tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className={`mt-0.5 truncate text-[14px] ${escuro ? 'text-white/70' : 'text-[var(--leve)]'}`}>{subtitle}</p>}
        </div>
        {showSearch && (
          <button onClick={onSearchClick || (() => navigate('/busca'))} className={`pressiona flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${botao}`} aria-label="Buscar">
            <Search size={19} />
          </button>
        )}
      </div>
    </header>
  )
}
