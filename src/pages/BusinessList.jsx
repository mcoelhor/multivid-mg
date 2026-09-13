import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { BusinessCard } from '../components/UI/BusinessCard'
import { LoadingSpinner } from '../components/UI/LoadingSpinner'
import { useBusinesses } from '../hooks/useBusinesses'
import { CATEGORIES } from '../data/categories'

function FilterChips({ category, activeSubcat, onSubcat }) {
  const cat = CATEGORIES.find(c => c.slug === category)
  if (!cat) return null
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
      <button
        onClick={() => onSubcat(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !activeSubcat
            ? 'text-white'
            : 'bg-white text-gray-600 border border-gray-200'
        }`}
        style={!activeSubcat ? { background: '#14532d' } : {}}
      >
        Todos
      </button>
      {cat.subcategories.map(sub => (
        <button
          key={sub.id}
          onClick={() => onSubcat(sub.slug)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeSubcat === sub.slug
              ? 'text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
          style={activeSubcat === sub.slug ? { background: '#14532d' } : {}}
        >
          <span>{sub.icon}</span>
          {sub.name}
        </button>
      ))}
    </div>
  )
}

function SortBar({ sort, onSort, openNow, onOpenNow }) {
  return (
    <div className="flex items-center gap-2 px-4 pb-3">
      <button
        onClick={onOpenNow}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          openNow ? 'border-green-700 text-green-800 bg-green-50' : 'border-gray-200 text-gray-600 bg-white'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-green-500' : 'bg-gray-300'}`} />
        Aberto agora
      </button>
      <button
        onClick={() => onSort(sort === 'rating' ? 'featured' : 'rating')}
        className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600"
      >
        {sort === 'rating' ? '⭐ Mais avaliados' : '✨ Destaques'} <ChevronDown size={12} />
      </button>
    </div>
  )
}

export function BusinessList() {
  const { category, subcategory } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const searchQuery = searchParams.get('q') || ''

  const [activeSubcat, setActiveSubcat] = useState(subcategory || null)
  const [openNow, setOpenNow] = useState(false)
  const [sort, setSort] = useState('featured')
  const [localSearch, setLocalSearch] = useState(searchQuery)

  useEffect(() => { setActiveSubcat(subcategory || null) }, [subcategory])
  useEffect(() => { setLocalSearch(searchQuery) }, [searchQuery])

  const { businesses, loading } = useBusinesses({
    category,
    subcategory: activeSubcat,
    search: localSearch || undefined,
    openNow,
    sortBy: sort,
  })

  const cat = CATEGORIES.find(c => c.slug === category)
  const title = searchQuery
    ? `Busca: "${searchQuery}"`
    : cat
    ? cat.name
    : 'Estabelecimentos'

  const handleSearch = (e) => {
    e.preventDefault()
    if (localSearch.trim()) navigate(`/busca?q=${encodeURIComponent(localSearch.trim())}`)
  }

  return (
    <Layout title={title} showBack subtitle={cat?.description}>
      <div className="pt-3">
        {searchQuery && (
          <form onSubmit={handleSearch} className="px-4 pb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-9 py-2.5 bg-white rounded-xl text-sm border border-gray-200 text-gray-800"
              />
              {localSearch && (
                <button type="button" onClick={() => setLocalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          </form>
        )}

        {category && (
          <FilterChips
            category={category}
            activeSubcat={activeSubcat}
            onSubcat={setActiveSubcat}
          />
        )}

        <SortBar
          sort={sort}
          onSort={setSort}
          openNow={openNow}
          onOpenNow={() => setOpenNow(v => !v)}
        />

        {loading ? (
          <LoadingSpinner />
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-gray-600 font-medium">Nenhum resultado encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente outros termos ou categorias</p>
          </div>
        ) : (
          <div className="px-4 space-y-4 pb-4">
            <p className="text-xs text-gray-400 font-medium">
              {businesses.length} estabelecimento{businesses.length !== 1 ? 's' : ''} encontrado{businesses.length !== 1 ? 's' : ''}
            </p>
            {businesses.map(b => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
