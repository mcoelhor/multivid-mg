import { useNavigate } from 'react-router-dom'
import { Heart, Flame, Settings, Info, Building2, ChevronRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { MOCK_PROMOTIONS } from '../data/mockData'

function PromotionCard({ promo }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {promo.image && (
        <img src={promo.image} alt={promo.title} className="w-full h-36 object-cover" loading="lazy" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 font-medium">{promo.business_name}</span>
            <h3 className="font-bold text-gray-900 text-sm mt-0.5">{promo.title}</h3>
          </div>
          <span className="shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Flame size={10} /> {promo.discount}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{promo.description}</p>
        <p className="text-xs text-gray-400 mt-1">
          Válido até {new Date(promo.valid_until + 'T00:00:00').toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  )
}

function MenuRow({ icon: Icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl"
    >
      <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
        <Icon size={20} className="text-green-800" />
      </div>
      <span className="flex-1 text-sm font-medium text-gray-800 text-left">{label}</span>
      {badge && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mr-1">{badge}</span>
      )}
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  )
}

export function More() {
  const navigate = useNavigate()

  return (
    <Layout title="Mais" subtitle="Multivid MG">
      <div className="px-4 pt-4 pb-4 space-y-5">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Ofertas</h2>
          <div className="space-y-3">
            {MOCK_PROMOTIONS.map(p => <PromotionCard key={p.id} promo={p} />)}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Menu</h2>
          <div className="space-y-2">
            <MenuRow icon={Heart} label="Meus Favoritos" onClick={() => navigate('/favoritos')} />
            <MenuRow icon={Building2} label="Cadastrar minha empresa" onClick={() => navigate('/admin')} />
            <MenuRow icon={Settings} label="Painel Administrativo" onClick={() => navigate('/admin')} />
            <MenuRow icon={Info} label="Sobre o Multivid MG" onClick={() => {}} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-emerald-700 rounded-2xl p-5 text-white text-center">
          <p className="text-2xl mb-2">🌿</p>
          <h3 className="font-bold text-lg">Multivid MG</h3>
          <p className="text-emerald-200 text-sm mt-1">
            O guia completo de Monte Verde e região.
          </p>
          <p className="text-emerald-300 text-xs mt-3">
            Monte Verde · Camanducaia · Região
          </p>
        </div>
      </div>
    </Layout>
  )
}
