export const CATEGORIES = [
  {
    id: 'alimentacao',
    name: 'Alimentação',
    slug: 'alimentacao',
    icon: '🍽',
    color: '#FF6B35',
    bg: '#FFF0EB',
    description: 'Restaurantes, bares, cafés e muito mais',
    subcategories: [
      { id: 'restaurantes', name: 'Restaurantes', slug: 'restaurantes', icon: '🍴' },
      { id: 'pizzarias', name: 'Pizzarias', slug: 'pizzarias', icon: '🍕' },
      { id: 'hamburguerias', name: 'Hamburguerias', slug: 'hamburguerias', icon: '🍔' },
      { id: 'cafeterias', name: 'Cafeterias', slug: 'cafeterias', icon: '☕' },
      { id: 'bares', name: 'Bares', slug: 'bares', icon: '🍺' },
      { id: 'padarias', name: 'Padarias', slug: 'padarias', icon: '🥐' },
      { id: 'docerias', name: 'Docerias', slug: 'docerias', icon: '🍰' },
      { id: 'chocolaterias', name: 'Chocolaterias', slug: 'chocolaterias', icon: '🍫' },
      { id: 'sorveterias', name: 'Sorveterias', slug: 'sorveterias', icon: '🍦' },
      { id: 'delivery', name: 'Delivery', slug: 'delivery', icon: '🛵' },
    ],
  },
  {
    id: 'hospedagem',
    name: 'Hospedagem',
    slug: 'hospedagem',
    icon: '🏨',
    color: '#2563EB',
    bg: '#EFF6FF',
    description: 'Hotéis, pousadas, chalés e hospedagens',
    subcategories: [
      { id: 'hoteis', name: 'Hotéis', slug: 'hoteis', icon: '🏨' },
      { id: 'pousadas', name: 'Pousadas', slug: 'pousadas', icon: '🏡' },
      { id: 'chales', name: 'Chalés', slug: 'chales', icon: '🏠' },
      { id: 'casas', name: 'Casas', slug: 'casas', icon: '🏘' },
      { id: 'resorts', name: 'Resorts', slug: 'resorts', icon: '🏖' },
    ],
  },
  {
    id: 'turismo',
    name: 'Turismo',
    slug: 'turismo',
    icon: '🏔',
    color: '#059669',
    bg: '#ECFDF5',
    description: 'Passeios, trilhas, parques e atrações',
    subcategories: [
      { id: 'atrativos', name: 'Pontos Turísticos', slug: 'atrativos', icon: '📍' },
      { id: 'trilhas', name: 'Trilhas', slug: 'trilhas', icon: '🥾' },
      { id: 'cachoeiras', name: 'Cachoeiras', slug: 'cachoeiras', icon: '💧' },
      { id: 'mirantes', name: 'Mirantes', slug: 'mirantes', icon: '🔭' },
      { id: 'pedras', name: 'Pedras e Rochas', slug: 'pedras', icon: '🪨' },
      { id: 'fontes', name: 'Fontes e Nascentes', slug: 'fontes', icon: '🌊' },
      { id: 'parques', name: 'Parques', slug: 'parques', icon: '🌳' },
      { id: 'passeios', name: 'Passeios', slug: 'passeios', icon: '🚶' },
      { id: 'aventuras', name: 'Aventuras', slug: 'aventuras', icon: '🧗' },
      { id: 'ecoturismo', name: 'Ecoturismo', slug: 'ecoturismo', icon: '🌿' },
      { id: 'guias', name: 'Guias Turísticos', slug: 'guias', icon: '🗺' },
    ],
  },
  {
    id: 'compras',
    name: 'Compras',
    slug: 'compras',
    icon: '🛍',
    color: '#7C3AED',
    bg: '#F5F3FF',
    description: 'Mercados, lojas, artesanato e presentes',
    subcategories: [
      { id: 'supermercados', name: 'Supermercados', slug: 'supermercados', icon: '🛒' },
      { id: 'mercados', name: 'Mercados', slug: 'mercados', icon: '🏪' },
      { id: 'roupas', name: 'Roupas', slug: 'roupas', icon: '👕' },
      { id: 'artesanato', name: 'Artesanato', slug: 'artesanato', icon: '🎨' },
      { id: 'presentes', name: 'Presentes', slug: 'presentes', icon: '🎁' },
      { id: 'souvenirs', name: 'Souvenirs', slug: 'souvenirs', icon: '🗿' },
    ],
  },
  {
    id: 'servicos',
    name: 'Serviços',
    slug: 'servicos',
    icon: '🔧',
    color: '#D97706',
    bg: '#FFFBEB',
    description: 'Eletricistas, pedreiros, fotógrafos e mais',
    subcategories: [
      { id: 'eletricistas', name: 'Eletricistas', slug: 'eletricistas', icon: '⚡' },
      { id: 'encanadores', name: 'Encanadores', slug: 'encanadores', icon: '🔩' },
      { id: 'pedreiros', name: 'Pedreiros', slug: 'pedreiros', icon: '🧱' },
      { id: 'fotografos', name: 'Fotógrafos', slug: 'fotografos', icon: '📷' },
      { id: 'contadores', name: 'Contadores', slug: 'contadores', icon: '📊' },
      { id: 'advogados', name: 'Advogados', slug: 'advogados', icon: '⚖' },
      { id: 'tecnologia', name: 'Tecnologia', slug: 'tecnologia', icon: '💻' },
    ],
  },
  {
    id: 'transporte',
    name: 'Transporte',
    slug: 'transporte',
    icon: '🚕',
    color: '#0891B2',
    bg: '#ECFEFF',
    description: 'Táxis, transfer, oficinas e locadoras',
    subcategories: [
      { id: 'taxis', name: 'Táxis', slug: 'taxis', icon: '🚕' },
      { id: 'transfer', name: 'Transfer', slug: 'transfer', icon: '🚐' },
      { id: 'locadoras', name: 'Locadoras', slug: 'locadoras', icon: '🚗' },
      { id: 'oficinas', name: 'Oficinas', slug: 'oficinas', icon: '🔧' },
      { id: 'borracharias', name: 'Borracharias', slug: 'borracharias', icon: '🛞' },
    ],
  },
  {
    id: 'saude',
    name: 'Saúde',
    slug: 'saude',
    icon: '💊',
    color: '#DC2626',
    bg: '#FEF2F2',
    description: 'Farmácias, clínicas, médicos e dentistas',
    subcategories: [
      { id: 'farmacias', name: 'Farmácias', slug: 'farmacias', icon: '💊' },
      { id: 'clinicas', name: 'Clínicas', slug: 'clinicas', icon: '🏥' },
      { id: 'dentistas', name: 'Dentistas', slug: 'dentistas', icon: '🦷' },
      { id: 'laboratorios', name: 'Laboratórios', slug: 'laboratorios', icon: '🔬' },
      { id: 'veterinarios', name: 'Veterinários', slug: 'veterinarios', icon: '🐾' },
    ],
  },
  {
    id: 'construcao',
    name: 'Construção',
    slug: 'construcao',
    icon: '🏗',
    color: '#92400E',
    bg: '#FEF3C7',
    description: 'Materiais, construtoras e profissionais',
    subcategories: [
      { id: 'materiais', name: 'Materiais', slug: 'materiais', icon: '🧱' },
      { id: 'ferragens', name: 'Ferragens', slug: 'ferragens', icon: '🔨' },
      { id: 'construtoras', name: 'Construtoras', slug: 'construtoras', icon: '🏗' },
      { id: 'engenheiros', name: 'Engenheiros', slug: 'engenheiros', icon: '📐' },
      { id: 'arquitetos', name: 'Arquitetos', slug: 'arquitetos', icon: '✏' },
    ],
  },
  {
    id: 'imobiliarias',
    name: 'Imobiliárias',
    slug: 'imobiliarias',
    icon: '🏠',
    color: '#0D9488',
    bg: '#F0FDFA',
    description: 'Imóveis para compra, venda, aluguel e temporada',
    subcategories: [
      { id: 'compra-venda', name: 'Compra e Venda', slug: 'compra-venda', icon: '🤝' },
      { id: 'aluguel', name: 'Aluguel', slug: 'aluguel', icon: '🔑' },
      { id: 'temporada', name: 'Temporada', slug: 'temporada', icon: '🏖' },
      { id: 'terrenos', name: 'Terrenos', slug: 'terrenos', icon: '🌍' },
    ],
  },
]

export const getCategoryBySlug = (slug) =>
  CATEGORIES.find(c => c.slug === slug || c.subcategories?.some(s => s.slug === slug))

export const getMainCategory = (slug) =>
  CATEGORIES.find(c => c.slug === slug)

export const getSubcategoryBySlug = (slug) => {
  for (const cat of CATEGORIES) {
    const sub = cat.subcategories?.find(s => s.slug === slug)
    if (sub) return { ...sub, parent: cat }
  }
  return null
}

export const HOME_ACTIONS = [
  { label: 'Comer', icon: '🍽', slug: 'alimentacao', color: '#FF6B35', bg: '#FFF0EB' },
  { label: 'Hospedar', icon: '🏨', slug: 'hospedagem', color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Conhecer', icon: '🏔', slug: 'turismo', color: '#059669', bg: '#ECFDF5' },
  { label: 'Comprar', icon: '🛍', slug: 'compras', color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Ir a algum lugar', icon: '🚕', slug: 'transporte', color: '#0891B2', bg: '#ECFEFF' },
  { label: 'Serviços', icon: '🔧', slug: 'servicos', color: '#D97706', bg: '#FFFBEB' },
  { label: 'Saúde', icon: '💊', slug: 'saude', color: '#DC2626', bg: '#FEF2F2' },
  { label: 'Imóveis', icon: '🏠', slug: 'imobiliarias', color: '#0D9488', bg: '#F0FDFA' },
]
