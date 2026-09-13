import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, Calendar, Tag, ArrowLeft, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/empresas', icon: Building2, label: 'Empresas' },
  { path: '/admin/eventos', icon: Calendar, label: 'Eventos' },
  { path: '/admin/categorias', icon: Tag, label: 'Categorias' },
]

export function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path)

  const handleLogout = () => {
    localStorage.removeItem('multivid_admin')
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#F4F1EB' }}>
      <header className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3" style={{ background: '#14532d' }}>
        <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <p className="text-white font-bold text-base">Painel Admin</p>
          <p className="text-emerald-300 text-xs">Multivid MG</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium">
          <LogOut size={14} /> Sair
        </button>
      </header>

      <nav className="flex overflow-x-auto gap-1 px-4 py-2 bg-white border-b border-gray-100 scrollbar-hide">
        {NAV_ITEMS.map(({ path, icon: Icon, label, exact }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isActive(path, exact) ? 'text-white' : 'text-gray-500 bg-gray-50'
            }`}
            style={isActive(path, exact) ? { background: '#14532d' } : {}}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-4 pb-8">
        {children}
      </main>
    </div>
  )
}
