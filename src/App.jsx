import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Categories } from './pages/Categories'
import { BusinessList } from './pages/BusinessList'
import { BusinessDetail } from './pages/BusinessDetail'
import { MapPage } from './pages/MapPage'
import { Events, EventDetail } from './pages/Events'
import { Favorites } from './pages/Favorites'
import { More } from './pages/More'
import { AdminLogin } from './admin/AdminLogin'
import { AdminDashboard } from './admin/AdminDashboard'
import { AdminBusinesses } from './admin/AdminBusinesses'
import { AdminEvents } from './admin/AdminEvents'
import { AdminCategories } from './admin/AdminCategories'

function AdminGuard({ children }) {
  const [authed, setAuthed] = useState(!!localStorage.getItem('multivid_admin'))
  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
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
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/empresas" element={<AdminGuard><AdminBusinesses /></AdminGuard>} />
        <Route path="/admin/eventos" element={<AdminGuard><AdminEvents /></AdminGuard>} />
        <Route path="/admin/categorias" element={<AdminGuard><AdminCategories /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
