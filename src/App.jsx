import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Home } from './pages/Home'
import { Sos } from './pages/Sos'
import { Categories } from './pages/Categories'
import { BusinessList } from './pages/BusinessList'
import { BusinessDetail } from './pages/BusinessDetail'
import { Events, EventDetail } from './pages/Events'
import { Favorites } from './pages/Favorites'
import { More } from './pages/More'
import { Anuncie } from './pages/Anuncie'
import { AdminLogin } from './admin/AdminLogin'
const MapPage = lazy(() => import('./pages/MapPage').then(m => ({ default: m.MapPage })))
const AdminDashboard = lazy(() => import('./admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const AdminLeads = lazy(() => import('./admin/AdminLeads').then(m => ({ default: m.AdminLeads })))
const AdminBuscas = lazy(() => import('./admin/AdminBuscas').then(m => ({ default: m.AdminBuscas })))
const AdminBusinesses = lazy(() => import('./admin/AdminBusinesses').then(m => ({ default: m.AdminBusinesses })))
const AdminEvents = lazy(() => import('./admin/AdminEvents').then(m => ({ default: m.AdminEvents })))
import { useAdmin } from './admin/useAdmin'

function AdminGuard({ children }) {
  const { carregando, user, admin } = useAdmin()
  if (carregando) return <div className="p-6"><div className="esqueleto h-40 rounded-2xl" /></div>
  if (!admin) return <AdminLogin user={user} />
  return children
}

function RolaProTopo() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <RolaProTopo />
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
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/leads" element={<AdminGuard><AdminLeads /></AdminGuard>} />
        <Route path="/admin/buscas" element={<AdminGuard><AdminBuscas /></AdminGuard>} />
        <Route path="/admin/empresas" element={<AdminGuard><AdminBusinesses /></AdminGuard>} />
        <Route path="/admin/eventos" element={<AdminGuard><AdminEvents /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
