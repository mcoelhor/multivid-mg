import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, MapPin, Search } from 'lucide-react'

export function Header({ title, showBack, showSearch, onSearchClick, subtitle }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header
      className="sticky top-0 z-40 px-4 py-3"
      style={{ background: '#14532d' }}
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white"
          >
            <ArrowLeft size={20} />
          </button>
        ) : null}

        <div className="flex-1 min-w-0">
          {isHome ? (
            <>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-white font-bold text-xl tracking-tight">MULTIVID MG</span>
                <span className="text-emerald-300 text-xs">●</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-200 text-xs">
                <MapPin size={11} />
                <span>Monte Verde · Camanducaia · Região</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-white font-bold text-lg leading-tight truncate">{title}</h1>
              {subtitle && <p className="text-emerald-200 text-xs truncate">{subtitle}</p>}
            </>
          )}
        </div>

        {showSearch && (
          <button
            onClick={onSearchClick}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white"
          >
            <Search size={18} />
          </button>
        )}
      </div>
    </header>
  )
}
