import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { MOCK_EVENTS } from '../data/mockData'

const CATEGORY_LABELS = {
  musica: '🎵 Música', gastronomia: '🍽 Gastronomia', festival: '🎉 Festival',
  turismo: '🏔 Turismo', feiras: '🛍 Feiras', cultura: '🎭 Cultura',
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function AdminEvents() {
  const [events, setEvents] = useState(MOCK_EVENTS)
  const [search, setSearch] = useState('')

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  )

  const toggleActive = (id) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e))
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Eventos</h2>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: '#14532d' }}>
            <Plus size={16} /> Novo
          </button>
        </div>

        <input
          type="search"
          placeholder="Buscar eventos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm"
        />

        <div className="space-y-3">
          {filtered.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {ev.image && <img src={ev.image} alt={ev.title} className="w-full h-32 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{ev.title}</h3>
                  <button
                    onClick={() => toggleActive(ev.id)}
                    className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      ev.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {ev.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {CATEGORY_LABELS[ev.category] || ev.category} · {formatDate(ev.date_start)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">📍 {ev.location}</p>
                <div className="flex gap-2 mt-3 pt-2 border-t border-gray-50">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold">
                    <Edit2 size={12} /> Editar
                  </button>
                  <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold">
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
