import { useNavigate } from 'react-router-dom'
import { Building2, Calendar, Tag, TrendingUp } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { MOCK_BUSINESSES, MOCK_EVENTS } from '../data/mockData'

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 w-full">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: color + '20' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="text-left">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </button>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const active = MOCK_BUSINESSES.filter(b => b.status === 'active').length
  const featured = MOCK_BUSINESSES.filter(b => b.featured).length

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Bem-vindo ao painel 👋</h2>
          <p className="text-sm text-gray-500">Gerencie os dados do Multivid MG</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Building2} label="Empresas ativas" value={active} color="#14532d" onClick={() => navigate('/admin/empresas')} />
          <StatCard icon={TrendingUp} label="Em destaque" value={featured} color="#F59E0B" onClick={() => navigate('/admin/empresas')} />
          <StatCard icon={Calendar} label="Eventos" value={MOCK_EVENTS.length} color="#3B82F6" onClick={() => navigate('/admin/eventos')} />
          <StatCard icon={Tag} label="Categorias" value={9} color="#8B5CF6" onClick={() => navigate('/admin/categorias')} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Ações rápidas</h3>
          <div className="space-y-2">
            {[
              { label: '➕ Nova empresa', path: '/admin/empresas/nova' },
              { label: '📅 Novo evento', path: '/admin/eventos/novo' },
              { label: '📋 Ver todas as empresas', path: '/admin/empresas' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full text-left px-4 py-3 bg-gray-50 rounded-xl text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-emerald-700 rounded-2xl p-4 text-white text-sm">
          <p className="font-bold mb-1">💡 Próximos passos</p>
          <ul className="space-y-1 text-emerald-200 text-xs">
            <li>• Conectar banco de dados Supabase</li>
            <li>• Importar dados dos estabelecimentos</li>
            <li>• Configurar upload de imagens</li>
            <li>• Ativar PWA para dispositivos móveis</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
