import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { useFavorites } from '../hooks/useFavorites'
import { useBusinesses } from '../hooks/useBusinesses'

export function Favorites() {
  const { favorites } = useFavorites()
  const { businesses, loading } = useBusinesses()
  const favs = businesses.filter(b => favorites.businesses.includes(b.id))

  return (
    <Layout title="Lugares salvos" subtitle={favs.length ? `${favs.length} salvos` : undefined}>
      {!loading && favs.length === 0 ? (
        <div className="flex flex-col items-center px-8 py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--raio)] bg-white"><Heart size={26} className="text-[#d43c3c]" /></span>
          <p className="font-semibold">Nada salvo ainda</p>
          <p className="mt-1 text-sm text-[var(--leve)]">Toque no coração de um lugar para guardar aqui. Fica salvo neste celular.</p>
          <Link to="/" className="botao botao-pri mt-5">Explorar</Link>
        </div>
      ) : (
        <div className="space-y-3 px-5 pt-4">{favs.map((b, i) => <BusinessCard key={b.id} business={b} index={i} />)}</div>
      )}
    </Layout>
  )
}
