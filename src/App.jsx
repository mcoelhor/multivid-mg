import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import { useEffect, useLayoutEffect, lazy, Suspense } from 'react'
import { Home } from './pages/Home'
import { Sos } from './pages/Sos'
import { Categories } from './pages/Categories'
import { BusinessList } from './pages/BusinessList'
import { BusinessDetail } from './pages/BusinessDetail'
import { Events, EventDetail } from './pages/Events'
import { Favorites } from './pages/Favorites'
import { More } from './pages/More'
import { Anuncie, AnuncieObrigado } from './pages/Anuncie'
import { Roteiro } from './pages/Roteiro'
import { Creditos } from './pages/Creditos'
import { Uteis } from './pages/Uteis'
import { NaoEncontrada } from './pages/NaoEncontrada'
import { AdminLogin } from './admin/AdminLogin'
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminLeads = lazy(() => import('./admin/AdminLeads').then(m => ({ default: m.AdminLeads })))
const AdminBuscas = lazy(() => import('./admin/AdminBuscas').then(m => ({ default: m.AdminBuscas })))
const AdminBusinesses = lazy(() => import('./admin/AdminBusinesses').then(m => ({ default: m.AdminBusinesses })))
const AdminPagamentos = lazy(() => import('./admin/AdminPagamentos').then(m => ({ default: m.AdminPagamentos })))
const AdminEvents = lazy(() => import('./admin/AdminEvents').then(m => ({ default: m.AdminEvents })))
import { useAdmin } from './admin/useAdmin'

function AdminGuard({ children }) {
  const { carregando, user, admin } = useAdmin()
  if (carregando) return <div className="p-6"><div className="esqueleto h-40 rounded-2xl" /></div>
  if (!admin) return <AdminLogin user={user} />
  return children
}

// Rolagem: ao voltar, devolve a posição onde a pessoa estava; em página nova, vai ao topo.
const POSICOES = new Map()
function Rolagem() {
  const { pathname, search, hash, key } = useLocation()
  const tipo = useNavigationType()
  useLayoutEffect(() => {
    // Um evento de rolagem pode chegar depois que a página já trocou (o documento encolhe e
    // scrollY vira 0): só grava quando o endereço da janela ainda é o desta página.
    const caminho = pathname + search
    const guarda = () => { if (window.location.pathname + window.location.search === caminho) POSICOES.set(key, window.scrollY) }
    window.addEventListener('scroll', guarda, { passive: true })
    return () => window.removeEventListener('scroll', guarda)
  }, [key, pathname, search])
  useEffect(() => {
    if (hash) return
    if (tipo === 'POP' && POSICOES.has(key)) {
      const y = POSICOES.get(key)
      // espera a lista pintar antes de rolar
      let n = 0
      const tenta = () => { window.scrollTo(0, y); if (window.scrollY < y - 4 && n++ < 30) setTimeout(tenta, 30) }
      requestAnimationFrame(tenta)
    } else window.scrollTo(0, 0)
  }, [key, hash, tipo])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <Rolagem />
      <Suspense fallback={<div className="p-6"><div className="esqueleto h-40 rounded-2xl" /></div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sos" element={<Sos />} />
        <Route path="/categorias" element={<Categories />} />
        <Route path="/categoria/:category" element={<BusinessList />} />
        <Route path="/categoria/:category/:subcategory" element={<BusinessList />} />
        <Route path="/busca" element={<BusinessList />} />
        <Route path="/estabelecimento/:slug" element={<BusinessDetail />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/eventos" element={<Events />} />
        <Route path="/evento/:id" element={<EventDetail />} />
        <Route path="/favoritos" element={<Favorites />} />
        <Route path="/mais" element={<More />} />
        <Route path="/anuncie" element={<Anuncie />} />
        <Route path="/anuncie/obrigado" element={<AnuncieObrigado />} />
        <Route path="/roteiro" element={<Roteiro />} />
        <Route path="/creditos" element={<Creditos />} />
        <Route path="/uteis" element={<Uteis />} />
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/pagamentos" element={<AdminGuard><AdminPagamentos /></AdminGuard>} />
        <Route path="/admin/leads" element={<AdminGuard><AdminLeads /></AdminGuard>} />
        <Route path="/admin/buscas" element={<AdminGuard><AdminBuscas /></AdminGuard>} />
        <Route path="/admin/empresas" element={<AdminGuard><AdminBusinesses /></AdminGuard>} />
        <Route path="/admin/eventos" element={<AdminGuard><AdminEvents /></AdminGuard>} />
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
