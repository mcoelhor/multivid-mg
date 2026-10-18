import { useNavigate, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, Map, Ellipsis, Siren } from 'lucide-react'

const TABS = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/categorias', icon: LayoutGrid, label: 'Categorias' },
  { path: '/sos', icon: Siren, label: 'Emergência', sos: true },
  { path: '/mapa', icon: Map, label: 'Mapa' },
  { path: '/mais', icon: Ellipsis, label: 'Mais' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ativo = p => (p === '/' ? pathname === '/' : pathname.startsWith(p))

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur z-50 shadow-[0_-1px_0_rgba(23,36,28,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ path, icon: Icon, label, sos }) => {
          const on = ativo(path)
          const cor = sos ? 'var(--sos)' : on ? 'var(--verde)' : '#8a918b'
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-current={on ? 'page' : undefined}
              className="pressiona relative flex flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span
                className="flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200"
                style={{ background: on ? (sos ? 'var(--sos-fundo)' : '#e3efe6') : 'transparent' }}
              >
                <Icon size={21} strokeWidth={on || sos ? 2.3 : 1.8} style={{ color: cor }} />
              </span>
              <span className="text-[10.5px] font-semibold" style={{ color: cor }}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
