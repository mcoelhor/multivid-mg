import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'

export function Header({ title, showBack, showSearch, onSearchClick, subtitle, tom = 'verde' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const sos = tom === 'sos'

  return (
    <header
      className="sticky top-0 z-40 px-4"
      style={{ background: sos ? 'var(--sos)' : 'var(--verde)', paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: 12 }}
    >
      <div className="flex items-center gap-3 min-h-9">
        {showBack && (
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="pressiona w-10 h-10 -ml-1 flex items-center justify-center rounded-xl bg-white/15 text-white"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          {isHome ? (
            <div className="flex items-baseline gap-2">
              <span className="text-white font-extrabold text-[19px] tracking-tight">Monte Verde</span>
              <span className="text-[#bfe3c9] text-xs font-semibold">MG</span>
            </div>
          ) : (
            <>
              <h1 className="text-white font-bold text-[17px] leading-tight truncate">{title}</h1>
              {subtitle && <p className="text-white/70 text-xs truncate mt-0.5">{subtitle}</p>}
            </>
          )}
        </div>
        {showSearch && (
          <button onClick={onSearchClick || (() => navigate('/busca'))} className="pressiona w-10 h-10 flex items-center justify-center rounded-xl bg-white/15 text-white" aria-label="Buscar">
            <Search size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
