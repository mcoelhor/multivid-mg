// Busca por problema: o turista escreve o que precisa ("dente quebrado", "pneu furou"),
// não o nome da categoria.

export function norm(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

// subcategoria -> palavras que o turista usa
const SINONIMOS = {
  'farmacias': ['remedio', 'farmacia', 'drogaria', 'dor', 'febre', 'curativo', 'fralda', 'termometro', 'alergia', 'dor de cabeca'],
  'pronto-socorro': ['emergencia', 'pronto socorro', 'hospital', 'medico', 'febre', 'machucou', 'torceu', 'corte', 'passando mal', 'urgencia', 'acidente', 'ps'],
  'hospitais': ['hospital', 'internacao', 'raio x', 'exame'],
  'clinicas': ['medico', 'consulta', 'clinica'],
  'dentistas': ['dente', 'dentista', 'quebrou o dente', 'dor de dente', 'aparelho', 'odonto', 'siso'],
  'laboratorios': ['exame', 'sangue', 'laboratorio'],
  'veterinarios': ['cachorro', 'gato', 'pet', 'veterinario', 'bicho', 'cao'],
  'oficinas': ['carro', 'mecanico', 'quebrou', 'guincho', 'bateria', 'nao liga', 'oficina', 'chaveiro', 'trancou', 'pane', 'reboque'],
  'borracharias': ['pneu', 'furou', 'borracharia', 'estepe', 'calibrar', 'pneu furado'],
  'postos': ['gasolina', 'combustivel', 'posto', 'etanol', 'diesel', 'abastecer'],
  'taxis': ['taxi', 'uber', 'transporte', 'corrida', 'motorista', 'rodoviaria', '99'],
  'utilidade-publica': ['policia', 'roubo', 'furto', 'bombeiro', 'samu', 'ambulancia', '190', '192', '193'],
  'supermercados': ['mercado', 'supermercado', 'pao', 'leite', 'agua', 'gelo', 'carvao', 'lenha', 'pilha', 'mercearia'],
  'bancos': ['dinheiro', 'caixa eletronico', 'caixa 24h', 'saque', 'banco', 'atm'],
  'correios': ['correio', 'encomenda', 'sedex'],
  'lavanderias': ['roupa', 'lavar', 'lavanderia'],
  'tecnologia': ['celular', 'carregador', 'notebook', 'computador', 'cabo'],
  'ferragens': ['chave de fenda', 'ferramenta', 'parafuso', 'alicate', 'motosserra', 'ferragem'],
  'materiais': ['cimento', 'material de construcao', 'tinta', 'deposito', 'chave de fenda', 'parafuso', 'lampada', 'cano'],
  'engenheiros': ['engenheiro', 'arquiteto', 'projeto', 'obra', 'construir', 'reforma', 'chale', 'terreno'],
  'compra-venda': ['imovel', 'casa', 'terreno', 'aluguel', 'comprar casa', 'lote', 'imobiliaria'],
  'restaurantes': ['jantar', 'almoco', 'comer', 'fome', 'comida', 'truta', 'mineira', 'fondue', 'romantico', 'restaurante'],
  'pizzarias': ['pizza', 'pizzaria'],
  'hamburguerias': ['hamburguer', 'lanche', 'burger'],
  'lanchonetes': ['lanche', 'salgado', 'rapido', 'lanchonete'],
  'cafeterias': ['cafe', 'cafe da manha', 'chocolate quente', 'doce', 'strudel', 'torta'],
  'padarias': ['pao', 'padaria', 'cafe da manha'],
  'chocolaterias': ['chocolate', 'presente', 'lembranca'],
  'bares': ['cerveja', 'chopp', 'bar', 'vinho', 'drink', 'beber'],
  'pousadas': ['pousada', 'hotel', 'chale', 'dormir', 'hospedagem', 'quarto', 'pernoite'],
  'atrativos': ['passeio', 'trilha', 'crianca', 'chuva', 'parque', 'mirante', 'o que fazer'],
  'passeios': ['quadriciclo', 'jeep', 'jipe', 'cavalo', 'tour', 'passeio', 'trenzinho'],
  'artesanato': ['lembranca', 'souvenir', 'artesanato', 'presente'],
  'pet-shops': ['pet shop', 'racao', 'coleira'],
}

/** Situações (atalhos da home). */
export const SITUACOES = [
  { id: 'chuva', rotulo: 'Dia de chuva', icone: 'CloudRain', subs: ['cafeterias', 'chocolaterias', 'restaurantes', 'bares', 'artesanato'] },
  { id: 'criancas', rotulo: 'Com crianças', icone: 'Baby', subs: ['atrativos', 'passeios', 'pizzarias', 'hamburguerias', 'lanchonetes'] },
  { id: 'a-dois', rotulo: 'A dois', icone: 'Heart', subs: ['restaurantes', 'bares', 'pousadas', 'cafeterias'] },
  { id: 'noite', rotulo: 'À noite', icone: 'Moon', subs: ['restaurantes', 'pizzarias', 'bares', 'hamburguerias'] },
  { id: 'pet', rotulo: 'Com pet', icone: 'Dog', subs: ['veterinarios', 'pet-shops', 'atrativos'] },
]

/** Subcategorias que combinam com o termo, da mais forte para a mais fraca. */
export function subsDoTermo(termo) {
  const t = norm(termo)
  if (!t) return []
  const pts = {}
  for (const [sub, lista] of Object.entries(SINONIMOS)) {
    if (norm(sub).includes(t)) { pts[sub] = 3; continue }
    for (const s of lista) {
      if (s === t || t.includes(s) || (t.length >= 4 && s.includes(t))) { pts[sub] = (pts[sub] || 0) + 2; break }
    }
  }
  for (const sit of SITUACOES) {
    if (t === sit.id || t.includes(norm(sit.rotulo))) sit.subs.forEach(s => { pts[s] = (pts[s] || 0) + 1 })
  }
  return Object.entries(pts).sort((a, b) => b[1] - a[1]).map(([s]) => s)
}

/** Pontua cada estabelecimento para o termo. Retorna só os que combinam, já com score. */
export function buscar(lista, termo) {
  const t = norm(termo)
  if (!t) return []
  const subs = subsDoTermo(t)
  const out = []
  for (const b of lista) {
    let score = 0
    const pos = subs.indexOf(b.subcategory)
    if (pos >= 0) score += 100 - pos * 5
    const nome = norm(b.name)
    if (nome.includes(t)) score += 80
    else if (t.length >= 3 && (b.tags || []).some(tag => norm(tag).includes(t))) score += 40
    else if (t.length >= 4 && norm(`${b.description} ${b.address}`).includes(t)) score += 15
    if (score) out.push({ ...b, score })
  }
  return out
}

const OBRA = ['obra', 'constru', 'reforma', 'engenhe', 'arquitet', 'pedreiro', 'chale', 'terreno', 'projeto', 'empreiteir', 'casa', 'imovel', 'lote', 'telhado', 'fundacao']
export function ehObra(termo) {
  const t = norm(termo)
  return OBRA.some(p => t.includes(p))
}
