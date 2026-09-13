import { useNavigate, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, Map, Calendar, MoreHorizontal } from 'lucide-react'

const TABS = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/categorias', icon: LayoutGrid, label: 'Categorias' },
  { path: '/mapa', icon: Map, label: 'Mapa' },
  { path: '/eventos', icon: Calendar, label: 'Eventos' },
  { path: '/mais', icon: MoreHorizontal, label: 'Mais' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? '#14532d' : '#9CA3AF' }}
              />
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? '#14532d' : '#9CA3AF' }}
              >
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full absolute bottom-2" style={{ background: '#14532d' }} />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
