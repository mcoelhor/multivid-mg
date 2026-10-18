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
  'restaurantes': ['jantar', 'almoco', 'comer', 'fome', 'comida', 'truta', 'mineira', 'fondue', 'restaurante', 'bistro', 'giratorio', 'comida de fazenda'],
  'pizzarias': ['pizza', 'pizzaria'],
  'hamburguerias': ['hamburguer', 'lanche', 'burger'],
  'lanchonetes': ['lanche', 'salgado', 'rapido', 'lanchonete'],
  'cafeterias': ['cafe', 'cafe da manha', 'chocolate quente', 'doce', 'strudel', 'torta', 'cafe colonial', 'lanche da tarde'],
  'padarias': ['pao', 'padaria', 'cafe da manha'],
  'chocolaterias': ['chocolate', 'presente', 'lembranca'],
  'bares': ['cerveja', 'chopp', 'bar', 'vinho', 'drink', 'beber', 'cervejaria', 'happy hour', 'destilaria'],
  'pousadas': ['pousada', 'hotel', 'chale', 'dormir', 'hospedagem', 'quarto', 'pernoite'],
  'atrativos': ['passeio', 'trilha', 'parque', 'mirante', 'o que fazer', 'aventura', 'adrenalina', 'radical', 'arborismo', 'tirolesa', 'escalada', 'caminhada', 'natureza', 'patinacao', 'gelo', 'voo', 'helicoptero', 'fazenda', 'cavalo', 'galeria', 'arte', 'ceramica', 'azeite', 'falcoaria'],
  'passeios': ['quadriciclo', 'jeep', 'jipe', 'cavalo', 'tour', 'passeio', 'trenzinho', 'aventura', 'moto', 'city tour'],
  'artesanato': ['lembranca', 'souvenir', 'artesanato', 'presente', 'malha', 'regional', 'produto local', 'lojinha', 'loja'],
  'pet-shops': ['pet shop', 'racao', 'coleira'],
}

/** Situações (atalhos da home). */
export const SITUACOES = [
  { id: 'chuva', rotulo: 'Dia de chuva', icone: 'CloudRain', tag: 'chuva', subs: ['chocolaterias', 'cafeterias', 'bares', 'artesanato', 'restaurantes'], termos: ['chuva', 'chovendo', 'coberto', 'frio'] },
  { id: 'criancas', rotulo: 'Com crianças', icone: 'Baby', tag: 'criancas', subs: ['atrativos', 'passeios', 'pizzarias', 'hamburguerias', 'lanchonetes'], termos: ['crianca', 'criancas', 'filhos', 'familia', 'infantil'] },
  { id: 'a-dois', rotulo: 'A dois', icone: 'Heart', tag: 'casal', subs: ['restaurantes', 'bares', 'cafeterias', 'pousadas'], termos: ['a dois', 'romantico', 'casal', 'namorada', 'namorado', 'lua de mel', 'aniversario'] },
  { id: 'aventura', rotulo: 'Aventura', icone: 'Mountain', tag: 'aventura', subs: ['atrativos', 'passeios'], termos: ['aventura', 'adrenalina', 'radical', 'esporte'] },
  { id: 'noite', rotulo: 'À noite', icone: 'Moon', tag: 'noite', subs: ['restaurantes', 'pizzarias', 'bares', 'hamburguerias'], termos: ['noite', 'a noite', 'hoje a noite', 'balada', 'jantar tarde'] },
  { id: 'pet', rotulo: 'Com pet', icone: 'Dog', tag: 'pet', subs: ['veterinarios', 'pet-shops', 'atrativos'], termos: ['pet', 'cachorro', 'com cachorro', 'pet friendly'] },
]

/** Situação que o termo descreve (id, rótulo ou palavras relacionadas), se houver. */
export function situacaoDoTermo(termo) {
  const t = norm(termo)
  return SITUACOES.find(s => t === s.id || t === norm(s.rotulo) || s.termos.some(x => t === x || t.includes(x))) || null
}

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
  const sit = situacaoDoTermo(t)
  if (sit) sit.subs.forEach((s, i) => { pts[s] = (pts[s] || 0) + 1 - i * 0.01 })
  return Object.entries(pts).sort((a, b) => b[1] - a[1]).map(([s]) => s)
}

/** Pontua cada estabelecimento para o termo. Retorna só os que combinam, já com score. */
export function buscar(lista, termo) {
  const t = norm(termo)
  if (!t) return []
  const subs = subsDoTermo(t)
  const sit = situacaoDoTermo(t)
  const out = []
  for (let b of lista) {
    let score = 0
    const tags = (b.tags || []).map(norm)
    const pos = subs.indexOf(b.subcategory)
    if (pos >= 0) score += 100 - pos * 5
    // Curadoria do guia: lugar marcado para a situação vai na frente de tudo
    if (sit && tags.includes(sit.tag)) { score += 300; b = { ...b, curado: sit.id } }
    const nome = norm(b.name)
    if (nome.includes(t)) score += 80
    else if (t.length >= 3 && tags.some(tag => tag.includes(t))) score += 40
    else if (t.length >= 4 && norm(`${b.description} ${b.address}`).includes(t)) score += 15
    if (score) out.push({ ...b, score })
  }
  return out
}

const URGENTE = /\b(dor|febre|machuc|acidente|torceu|corte|passando mal|socorro|hospital|remedio|farmacia|pneu|guincho|quebrou|bateria|nao liga|policia|roubo|furto|bombeiro|samu|ambulancia|urgenc|emergenc)/
/** O termo parece um apuro (saúde, carro, segurança)? Decide se o atalho de emergência aparece. */
export function ehUrgente(termo) {
  return URGENTE.test(norm(termo))
}

const OBRA = ['obra', 'constru', 'reforma', 'engenhe', 'arquitet', 'pedreiro', 'chale', 'terreno', 'projeto', 'empreiteir', 'casa', 'imovel', 'lote', 'telhado', 'fundacao']
export function ehObra(termo) {
  const t = norm(termo)
  return OBRA.some(p => t.includes(p))
}
