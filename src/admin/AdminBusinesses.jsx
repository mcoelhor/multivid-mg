import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Star, Check, X } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { MOCK_BUSINESSES } from '../data/mockData'
import { CATEGORIES } from '../data/categories'

function StatusBadge({ status }) {
  const map = {
    active: { label: 'Ativo', color: '#15803d', bg: '#F0FDF4' },
    pending: { label: 'Pendente', color: '#D97706', bg: '#FFFBEB' },
    inactive: { label: 'Inativo', color: '#6B7280', bg: '#F9FAFB' },
    suspended: { label: 'Suspenso', color: '#DC2626', bg: '#FEF2F2' },
  }
  const s = map[status] || map.inactive
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

export function AdminBusinesses() {
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || b.status === filterStatus
    return matchSearch && matchStatus
  })

  const toggleFeatured = (id) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, featured: !b.featured } : b))
  }

  const toggleStatus = (id) => {
    setBusinesses(prev => prev.map(b => b.id === id ? {
      ...b,
      status: b.status === 'active' ? 'inactive' : 'active'
    } : b))
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Empresas</h2>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#14532d' }}>
            <Plus size={16} /> Nova
          </button>
        </div>

        <input
          type="search"
          placeholder="Buscar por nome ou cidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm"
        />

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {['all', 'active', 'pending', 'inactive', 'suspended'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${
                filterStatus === s ? 'text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
              style={filterStatus === s ? { background: '#14532d' } : {}}
            >
              {s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 font-medium">{filtered.length} empresa{filtered.length !== 1 ? 's' : ''}</p>

        <div className="space-y-3">
          {filtered.map(b => {
            const cat = CATEGORIES.find(c => c.id === b.category)
            return (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {b.images?.[0] ? (
                    <img src={b.images[0]} alt={b.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: cat?.bg }}>
                      {cat?.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{b.name}</h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{cat?.name} · {b.city}</p>
                    <p className="text-xs text-gray-400 mt-0.5">⭐ {b.rating} ({b.review_count} avaliações)</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => toggleFeatured(b.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold ${
                      b.featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <Star size={13} fill={b.featured ? '#D97706' : 'none'} />
                    {b.featured ? 'Destaque' : 'Destacar'}
                  </button>
                  <button
                    onClick={() => toggleStatus(b.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold ${
                      b.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    {b.status === 'active' ? <Check size={13} /> : <X size={13} />}
                    {b.status === 'active' ? 'Ativo' : 'Ativar'}
                  </button>
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold">
                    <Edit2 size={13} /> Editar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
