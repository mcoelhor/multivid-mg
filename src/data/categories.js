// Categorias e subcategorias, nos mesmos códigos usados no banco.
// Ícones são nomes do lucide-react (sem emoji).

export const CATEGORIES = [
  {
    id: 'saude', slug: 'saude', name: 'Saúde', icon: 'Stethoscope', tint: '#B3261E',
    description: 'Pronto-socorro, farmácias, dentistas e veterinários',
    subcategories: [
      { id: 'pronto-socorro', slug: 'pronto-socorro', name: 'Pronto-socorro', icon: 'Siren' },
      { id: 'hospitais', slug: 'hospitais', name: 'Hospitais', icon: 'Hospital' },
      { id: 'farmacias', slug: 'farmacias', name: 'Farmácias', icon: 'Pill' },
      { id: 'dentistas', slug: 'dentistas', name: 'Dentistas', icon: 'Stethoscope' },
      { id: 'clinicas', slug: 'clinicas', name: 'Clínicas', icon: 'HeartPulse' },
      { id: 'laboratorios', slug: 'laboratorios', name: 'Laboratórios', icon: 'FlaskConical' },
      { id: 'veterinarios', slug: 'veterinarios', name: 'Veterinários', icon: 'PawPrint' },
    ],
  },
  {
    id: 'transporte', slug: 'transporte', name: 'Carro e transporte', icon: 'Car', tint: '#8A5A12',
    description: 'Mecânico, borracharia, posto e táxi',
    subcategories: [
      { id: 'oficinas', slug: 'oficinas', name: 'Mecânicos e guincho', icon: 'Wrench' },
      { id: 'borracharias', slug: 'borracharias', name: 'Borracharias', icon: 'CircleDot' },
      { id: 'postos', slug: 'postos', name: 'Postos', icon: 'Fuel' },
      { id: 'taxis', slug: 'taxis', name: 'Táxis', icon: 'CarTaxiFront' },
    ],
  },
  {
    id: 'alimentacao', slug: 'alimentacao', name: 'Comer', icon: 'Utensils', tint: '#A3431B',
    description: 'Restaurantes, fondue, cafés, pizzarias e bares',
    subcategories: [
      { id: 'restaurantes', slug: 'restaurantes', name: 'Restaurantes', icon: 'UtensilsCrossed' },
      { id: 'pizzarias', slug: 'pizzarias', name: 'Pizzarias', icon: 'Pizza' },
      { id: 'hamburguerias', slug: 'hamburguerias', name: 'Hamburguerias', icon: 'Sandwich' },
      { id: 'lanchonetes', slug: 'lanchonetes', name: 'Lanchonetes', icon: 'Sandwich' },
      { id: 'cafeterias', slug: 'cafeterias', name: 'Cafés', icon: 'Coffee' },
      { id: 'padarias', slug: 'padarias', name: 'Padarias', icon: 'Croissant' },
      { id: 'chocolaterias', slug: 'chocolaterias', name: 'Chocolaterias', icon: 'CakeSlice' },
      { id: 'bares', slug: 'bares', name: 'Bares e cervejarias', icon: 'Beer' },
    ],
  },
  {
    id: 'hospedagem', slug: 'hospedagem', name: 'Ficar', icon: 'BedDouble', tint: '#2F5E7A',
    description: 'Pousadas, hotéis e chalés',
    subcategories: [
      { id: 'pousadas', slug: 'pousadas', name: 'Pousadas e hotéis', icon: 'Hotel' },
    ],
  },
  {
    id: 'turismo', slug: 'turismo', name: 'Fazer', icon: 'Mountain', tint: '#2E6B3F',
    description: 'Passeios, trilhas, parques e aventura',
    subcategories: [
      { id: 'atrativos', slug: 'atrativos', name: 'Atrativos', icon: 'Trees' },
      { id: 'passeios', slug: 'passeios', name: 'Passeios', icon: 'Compass' },
    ],
  },
  {
    id: 'compras', slug: 'compras', name: 'Comprar', icon: 'ShoppingBag', tint: '#6A4C93',
    description: 'Mercados, artesanato e pet shop',
    subcategories: [
      { id: 'supermercados', slug: 'supermercados', name: 'Mercados', icon: 'ShoppingCart' },
      { id: 'artesanato', slug: 'artesanato', name: 'Artesanato e lembranças', icon: 'Store' },
      { id: 'pet-shops', slug: 'pet-shops', name: 'Pet shop', icon: 'PawPrint' },
    ],
  },
  {
    id: 'servicos', slug: 'servicos', name: 'Serviços', icon: 'Landmark', tint: '#4A5560',
    description: 'Banco, correios, lavanderia e outros',
    subcategories: [
      { id: 'bancos', slug: 'bancos', name: 'Bancos e caixa 24h', icon: 'Landmark' },
      { id: 'correios', slug: 'correios', name: 'Correios', icon: 'Mail' },
      { id: 'lavanderias', slug: 'lavanderias', name: 'Lavanderias', icon: 'WashingMachine' },
      { id: 'tecnologia', slug: 'tecnologia', name: 'Celular e informática', icon: 'Laptop' },
      { id: 'beleza', slug: 'beleza', name: 'Cabeleireiro e barbearia', icon: 'Scissors' },
      { id: 'fotografos', slug: 'fotografos', name: 'Fotografia', icon: 'Camera' },
      { id: 'contadores', slug: 'contadores', name: 'Contabilidade', icon: 'Calculator' },
      { id: 'orgaos-publicos', slug: 'orgaos-publicos', name: 'Atendimento ao turista', icon: 'Info' },
    ],
  },
  {
    id: 'construcao', slug: 'construcao', name: 'Construção', icon: 'HardHat', tint: '#7A5A2E',
    description: 'Depósitos, ferramentas e engenharia',
    subcategories: [
      { id: 'materiais', slug: 'materiais', name: 'Materiais de construção', icon: 'Hammer' },
      { id: 'ferragens', slug: 'ferragens', name: 'Ferramentas e ferragens', icon: 'Wrench' },
      { id: 'engenheiros', slug: 'engenheiros', name: 'Engenharia e arquitetura', icon: 'Ruler' },
    ],
  },
  {
    id: 'imobiliarias', slug: 'imobiliarias', name: 'Imóveis', icon: 'House', tint: '#2F6A66',
    description: 'Imobiliárias, terrenos e casas',
    subcategories: [
      { id: 'compra-venda', slug: 'compra-venda', name: 'Imobiliárias', icon: 'KeyRound' },
    ],
  },
]

export function categoria(id) {
  return CATEGORIES.find(c => c.id === id) || null
}

export function subcategoria(catId, subId) {
  return categoria(catId)?.subcategories.find(s => s.id === subId) || null
}

/** Ícone mais específico disponível para um estabelecimento. */
export function iconeDe(b) {
  return subcategoria(b.category, b.subcategory)?.icon || categoria(b.category)?.icon || 'Store'
}

export function nomeSub(b) {
  return subcategoria(b.category, b.subcategory)?.name || categoria(b.category)?.name || ''
}
