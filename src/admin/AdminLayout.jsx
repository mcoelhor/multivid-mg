import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Building2, Calendar, Inbox, Search, ArrowLeft, LogOut, Wallet, BadgeCheck, Megaphone } from 'lucide-react'
import { sair } from './useAdmin'

const NAV = [
  { path: '/admin', icon: LayoutDashboard, label: 'Painel', exact: true },
  { path: '/admin/pagamentos', icon: Wallet, label: 'Pagamentos' },
  { path: '/admin/donos', icon: BadgeCheck, label: 'Donos' },
  { path: '/admin/avisos', icon: Megaphone, label: 'Avisos e clima' },
  { path: '/admin/leads', icon: Inbox, label: 'Leads' },
  { path: '/admin/buscas', icon: Search, label: 'Buscas' },
  { path: '/admin/empresas', icon: Building2, label: 'Lugares' },
  { path: '/admin/eventos', icon: Calendar, label: 'Eventos' },
]

export function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ativo = (p, exato) => (exato ? pathname === p : pathname.startsWith(p))

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--creme)]">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-[var(--verde)] px-4 py-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}>
        <button onClick={() => navigate('/')} className="pressiona flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white" aria-label="Voltar ao app"><ArrowLeft size={17} /></button>
        <div className="flex-1"><p className="font-bold text-white">Painel do portal</p><p className="text-xs text-white/70">Monte Verde MG</p></div>
        <button onClick={async () => { await sair(); navigate('/') }} className="flex items-center gap-1.5 text-xs font-semibold text-white/80"><LogOut size={14} />Sair</button>
      </header>
      <nav className="flex gap-1.5 overflow-x-auto bg-white px-3 py-2 scrollbar-hide">
        {NAV.map(({ path, icon: I, label, exact }) => (
          <button key={path} onClick={() => navigate(path)} aria-current={ativo(path, exact) ? 'page' : undefined} className={`chip ${ativo(path, exact) ? 'ativo' : ''}`}><I size={14} />{label}</button>
        ))}
      </nav>
      <main className="page-transition flex-1 p-4 pb-10">{children}</main>
    </div>
  )
}
