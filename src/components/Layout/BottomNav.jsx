import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Compass, Route, LifeBuoy, Heart } from 'lucide-react'

const TABS = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/categorias', icon: Compass, label: 'Explorar' },
  { path: '/roteiro', icon: Route, label: 'Roteiro', meio: true },
  { path: '/uteis', icon: LifeBuoy, label: 'Úteis', tambem: ['/sos'] },
  { path: '/favoritos', icon: Heart, label: 'Salvos' },
]

/** Barra de baixo: faixa escura, sem vidro e sem sombra; o roteiro no meio. */
export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ativo = (p, tambem = []) => (p === '/' ? pathname === '/' : [p, ...tambem].some(x => pathname.startsWith(x)))

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] bg-[var(--araucaria)] lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação principal"
    >
      <div className="flex h-[68px] items-stretch px-2">
        {TABS.map(({ path, icon: Icon, label, meio, tambem }) => {
          const on = ativo(path, tambem)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-current={on ? 'page' : undefined}
              className="pressiona relative flex flex-1 flex-col items-center justify-center gap-1"
            >
              {meio ? (
                <span className={`flex h-10 w-14 items-center justify-center rounded-full transition-colors duration-200 ${on ? 'bg-[var(--broto)] text-[var(--araucaria)]' : 'bg-[var(--musgo)] text-white'}`}>
                  <Icon size={21} strokeWidth={2.2} />
                </span>
              ) : (
                <Icon size={22} strokeWidth={on ? 2.3 : 1.7} className={`transition-colors duration-200 ${on ? 'text-white' : 'text-white/55'}`} />
              )}
              <span className={`text-[13px] font-bold transition-colors duration-200 ${on ? 'text-white' : 'text-white/55'}`}>{label}</span>
              {!meio && <span className={`absolute top-1.5 h-1 w-1 rounded-full bg-[var(--broto)] transition-opacity duration-200 ${on ? 'opacity-100' : 'opacity-0'}`} />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
