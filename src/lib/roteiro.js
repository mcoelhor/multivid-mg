// Monta um roteiro de viagem com os lugares do guia, respeitando o horário de cada dia.
import { DIAS, parseDia, hhmm, agoraMV } from './horario'
import { norm } from './busca'
import { FOTOS } from '../data/fotos'

export const COM_QUEM = [
  ['casal', 'A dois'], ['familia', 'Com crianças'], ['amigos', 'Com amigos'], ['sozinho', 'Sozinho'],
]
export const GOSTOS = [
  ['comida', 'Comer bem'], ['natureza', 'Natureza e trilhas'], ['aventura', 'Aventura'],
  ['cafe', 'Café e chocolate'], ['cerveja', 'Cerveja e vinho'], ['compras', 'Lojinhas'], ['cultura', 'Arte e artesanato'],
]
export const RITMOS = [['calmo', 'Sem pressa'], ['cheio', 'Aproveitar tudo']]

// Paradas que não são um comércio: a própria vila.
const LIVRES = [
  { id: 'livre-avenida', name: 'Passeio pela Avenida Monte Verde', descricao: 'O centrinho a pé: vitrines, chocolaterias e as casas de madeira.', foto: FOTOS.avenida, tags: ['compras', 'cultura', 'todos'], slots: ['tarde', 'manha'] },
  { id: 'livre-nuvens', name: 'Procurar o mar de nuvens', descricao: 'Nas manhãs frias o vale costuma amanhecer coberto. Saia cedo e suba a um ponto alto.', foto: FOTOS.marDeNuvens, tags: ['natureza', 'casal'], slots: ['manha'], cedo: true },
  { id: 'livre-vielas', name: 'Vielas e galerias do centro', descricao: 'Lojinhas de artesanato, malhas e lembranças entre as ruas de pedra.', foto: FOTOS.viela, tags: ['compras', 'cultura'], slots: ['tarde'] },
  { id: 'livre-araucarias', name: 'Fim de tarde entre araucárias', descricao: 'Caminhe pelas ruas de terra fora do centro na hora dourada. Leve casaco: esfria rápido.', foto: FOTOS.porDoSol, tags: ['natureza', 'casal', 'sozinho'], slots: ['tarde'] },
]

// O que cada atrativo do guia oferece (pelo endereço de página)
const PERFIL = {
  'trilha-da-pedra-redonda': ['natureza', 'aventura', 'manha'],
  'multisport-mantiqueira': ['aventura', 'natureza'],
  'arborismo-hotel-cabeca-de-boi': ['aventura', 'familia'],
  'fazenda-radical': ['aventura', 'familia', 'amigos'],
  'chacara-adelia': ['familia', 'cultura'],
  'aluguel-de-cavalos-ronaldo': ['natureza', 'familia'],
  'falcoaria': ['natureza', 'familia'],
  'fazenda-pica-pau': ['comida', 'natureza', 'almoco'],
  'galeria-cristina-botallo': ['cultura', 'compras'],
  'unger-s-pottery-house': ['cultura', 'compras'],
  'parque-oschin': ['familia', 'natureza'],
  'patinacao-no-gelo': ['familia', 'amigos'],
  'voo-panoramico-aeroporto-de-monte-verde': ['aventura', 'casal'],
  'passeio-de-trenzinho': ['familia'],
  'claudio-locacao-de-moto-e-jipe': ['aventura', 'amigos'],
  'monte-moto-motos-e-quadriciclos': ['aventura', 'amigos'],
}

export const SLOTS = {
  manha: { rotulo: 'Manhã', hora: 600, fim: 720, icone: 'Sunrise' },
  almoco: { rotulo: 'Almoço', hora: 750, fim: 900, icone: 'UtensilsCrossed' },
  tarde: { rotulo: 'Tarde', hora: 900, fim: 1050, icone: 'Mountain' },
  cafe: { rotulo: 'Café da tarde', hora: 1000, fim: 1110, icone: 'Coffee' },
  jantar: { rotulo: 'Jantar', hora: 1170, fim: 1440, icone: 'Moon' },
}

/** No dia de hoje, períodos que já passaram não entram no roteiro. */
export function slotPassou(slot, dia, agora = agoraMV()) {
  return dia === agora.dia && agora.min >= SLOTS[slot].fim - 30
}

/** Dia de início padrão: hoje, ou amanhã se já passou das 19h. */
export function inicioPadrao(agora = agoraMV()) {
  return agora.min >= 1140 ? (agora.dia + 1) % 7 : agora.dia
}

/** Aberto naquele dia e hora? true | false | null (não sabemos) */
export function abertoEm(b, dia, min) {
  if (!b.hours && !b.open_24h) return null
  if (String(b.open_24h || '').toLowerCase() === 'sim') return true
  const hoje = parseDia(b.hours?.[DIAS[dia]])
  if (hoje === null) return null
  if (hoje.some(([a, f]) => min >= a && min < f - 30)) return true
  const ontem = parseDia(b.hours?.[DIAS[(dia + 6) % 7]]) || []
  if (ontem.some(([, f]) => f > 1440 && min < f - 1440 - 30)) return true
  return false
}

export function horarioDoDia(b, dia) {
  const p = parseDia(b.hours?.[DIAS[dia]])
  if (!p) return ''
  if (!p.length) return 'fechado'
  return p.map(([a, f]) => `${hhmm(a)}–${hhmm(f)}`).join(' e ')
}

const reNome = (b, re) => re.test(norm(b.name + ' ' + (b.description || '')))

function tagsDe(b) {
  const t = new Set([...(PERFIL[b.slug] || []), ...(b.tags || []).map(norm)])
  const s = b.subcategory
  if (b.category === 'turismo' && !PERFIL[b.slug]) t.add('natureza')
  if (['cafeterias', 'chocolaterias', 'padarias'].includes(s)) t.add('cafe')
  if (s === 'bares') { t.add('cerveja'); t.add('amigos') }
  if (s === 'restaurantes' || s === 'pizzarias') t.add('comida')
  if (reNome(b, /fondue|bistr|wine|vino|girator|cottage|provence|archange/)) t.add('casal')
  if (reNome(b, /truta|fazenda|rancho|caipira|mineir|roca/)) t.add('comida')
  if (['pizzarias', 'hamburguerias', 'lanchonetes'].includes(s)) t.add('familia')
  if (reNome(b, /cervej|pub|boteco|buteco|beer/)) t.add('cerveja')
  return t
}

function slotsDe(b) {
  const s = b.subcategory, p = PERFIL[b.slug] || []
  if (p.includes('almoco')) return ['almoco']
  if (b.category === 'turismo') return p.includes('manha') ? ['manha'] : ['manha', 'tarde']
  if (s === 'restaurantes') return ['almoco', 'jantar']
  if (s === 'pizzarias' || s === 'hamburguerias') return ['jantar']
  if (s === 'bares') return reNome(b, /restaurante|pub|bistr/) ? ['jantar'] : ['tarde', 'jantar']
  if (['cafeterias', 'chocolaterias', 'padarias'].includes(s)) return ['cafe']
  if (s === 'artesanato') return ['tarde']
  return []
}

// Gerador pseudoaleatório com semente (o mesmo pedido gera o mesmo roteiro; "outra sugestão" muda a semente)
function rng(seed) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296) }

/** Todos os candidatos possíveis, com suas marcas. */
export function candidatos(lugares) {
  const doGuia = lugares
    .filter(b => slotsDe(b).length)
    .map(b => ({ tipo: 'lugar', id: b.id, b, name: b.name, tags: tagsDe(b), slots: slotsDe(b) }))
  const livres = LIVRES.map(l => ({ tipo: 'livre', ...l, tags: new Set(l.tags) }))
  return [...doGuia, ...livres]
}

function pontua(c, slot, dia, perfil, sorte) {
  let p = sorte() * 2.2
  if (c.tipo === 'lugar') {
    const ab = abertoEm(c.b, dia, SLOTS[slot].hora)
    if (ab === false) return -1
    if (ab === true) p += 2
    const plano = c.b.plan_expires_at && new Date(c.b.plan_expires_at) <= new Date() ? 'free' : c.b.plan
    if (plano === 'premium') p += 3
    else if (plano === 'destaque') p += 2
  } else {
    p += 1.2
  }
  if (c.tags.has(perfil.comQuem)) p += 2
  for (const g of perfil.gostos) if (c.tags.has(g)) p += 2.5
  if (perfil.comQuem === 'familia' && c.tags.has('cerveja') && slot !== 'jantar') p -= 4
  if (c.tags.has('todos')) p += 0.5
  return p
}

/**
 * perfil: { dias, inicio (0=seg), comQuem, gostos[], ritmo, semente }
 * Devolve: [{ dia, paradas: [{ slot, item }] }]
 */
export function montarRoteiro(lugares, perfil) {
  const cands = candidatos(lugares)
  const sorte = rng(perfil.semente || 7)
  const usados = new Set()
  const ordemSlots = perfil.ritmo === 'cheio' ? ['manha', 'almoco', 'tarde', 'cafe', 'jantar'] : ['manha', 'almoco', 'tarde', 'jantar']
  const dias = []
  for (let k = 0; k < perfil.dias; k++) {
    const dia = (perfil.inicio + k) % 7
    const paradas = []
    for (const slot of ordemSlots) {
      // Calmo: o café da tarde entra no lugar da tarde quando o viajante gosta de café
      const s = slot === 'tarde' && perfil.ritmo !== 'cheio' && perfil.gostos.includes('cafe') && k % 2 === 1 ? 'cafe' : slot
      if (k === 0 && slotPassou(s, dia)) continue
      const melhor = escolher(cands, s, dia, perfil, sorte, usados)
      if (melhor) { usados.add(melhor.id); paradas.push({ slot: s, item: melhor }) }
    }
    dias.push({ dia, paradas })
  }
  return dias
}

export function escolher(cands, slot, dia, perfil, sorte, usados, pular = 0) {
  const lista = alternativas(cands, slot, dia, perfil, sorte, usados)
  return lista[pular] || null
}

export function alternativas(cands, slot, dia, perfil, sorte = rng(perfil.semente || 7), usados = new Set()) {
  return cands
    .filter(c => c.slots.includes(slot) && !usados.has(c.id))
    .map(c => ({ c, p: pontua(c, slot, dia, perfil, sorte) }))
    .filter(x => x.p >= 0)
    .sort((a, b) => b.p - a.p)
    .map(x => x.c)
}

const MOTIVOS = {
  casal: ['escolha do guia para casais', 'clima a dois', 'bom para um jantar a dois'],
  criancas: ['escolha do guia com crianças', 'as crianças gostam', 'espaço para a criançada'],
  aventura: ['escolha do guia para aventura', 'para quem quer adrenalina'],
  chuva: ['coberto, vale até na chuva'],
  regional: ['produto da região'],
  noite: ['bom à noite'],
}

/** Por que esta sugestão: hora real e, quando há curadoria, um motivo que varia. */
export function motivo(item, slot, dia, perfil, k = 0) {
  if (item.tipo === 'livre') return item.descricao
  const b = item.b
  const h = horarioDoDia(b, dia)
  const partes = [h && h !== 'fechado' ? `Abre ${h}` : 'Horário não confirmado: ligue antes']
  const curadas = (b.tags || []).map(norm)
  const tagPerfil = { casal: 'casal', familia: 'criancas', amigos: 'noite', sozinho: '' }[perfil.comQuem]
  const tag = [tagPerfil, ...perfil.gostos.map(g => ({ aventura: 'aventura', cultura: 'regional', compras: 'regional' })[g])].find(t => t && curadas.includes(t))
  if (tag) partes.push(MOTIVOS[tag][k % MOTIVOS[tag].length])
  return partes.join(' · ')
}

export function textoCompartilhar(roteiro, nomesDia) {
  const linhas = ['Meu roteiro em Monte Verde', '']
  roteiro.forEach((d, i) => {
    linhas.push(`*${nomesDia[i]}*`)
    d.paradas.forEach(p => linhas.push(`• ${SLOTS[p.slot].rotulo}: ${p.item.name}`))
    linhas.push('')
  })
  linhas.push('Montado em monteverdemg.com.br/roteiro')
  return linhas.join('\n')
}
