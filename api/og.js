// Pré-renderização para robôs (WhatsApp, Google, Facebook): HTML com título, descrição,
// imagem de prévia e dados estruturados. Pessoas continuam recebendo o app (ver vercel.json).
const SUPA = 'https://cpoxykaksqlrqnstjonv.supabase.co'
const KEY = 'sb_publishable_Azm8A8z7LluWcp7_pNruxQ_NZ03PaCL'
const FOTOS = `${SUPA}/storage/v1/object/public/fotos/cidade/`
const CATS = {
  alimentacao: ['Comer', 'Restaurantes, fondue, cafés, pizzarias e bares em Monte Verde', 'viela-lojas'],
  hospedagem: ['Ficar', 'Pousadas, hotéis e chalés em Monte Verde', 'chale-montanha'],
  turismo: ['Fazer', 'Passeios, trilhas, parques e aventura em Monte Verde', 'serra-mantiqueira'],
  compras: ['Comprar', 'Mercados, artesanato e lembranças de Monte Verde', 'galeria-centro'],
  saude: ['Saúde', 'Pronto-socorro, farmácias, dentistas e veterinários em Monte Verde', 'neblina-manha'],
  transporte: ['Carro e transporte', 'Mecânico, borracharia, posto e táxi em Monte Verde', 'avenida-centro'],
  servicos: ['Serviços', 'Banco, correios, lavanderia e outros serviços em Monte Verde', 'rua-araucaria'],
  construcao: ['Construção', 'Materiais, ferramentas e engenharia em Monte Verde', 'casa-enxaimel'],
  imobiliarias: ['Imóveis', 'Imobiliárias, terrenos e casas em Monte Verde', 'vila-pousadas'],
}
const SUBS = {
  restaurantes: 'Restaurantes', pizzarias: 'Pizzarias', hamburguerias: 'Hamburguerias', lanchonetes: 'Lanchonetes', cafeterias: 'Cafés', padarias: 'Padarias', chocolaterias: 'Chocolaterias', bares: 'Bares e cervejarias',
  pousadas: 'Pousadas e hotéis', atrativos: 'Atrativos', passeios: 'Passeios', supermercados: 'Mercados', artesanato: 'Artesanato e lembranças', 'pet-shops': 'Pet shop',
  'pronto-socorro': 'Pronto-socorro', hospitais: 'Hospitais', farmacias: 'Farmácias', dentistas: 'Dentistas', clinicas: 'Clínicas', laboratorios: 'Laboratórios', veterinarios: 'Veterinários',
  oficinas: 'Mecânicos e guincho', borracharias: 'Borracharias', postos: 'Postos', taxis: 'Táxis', bancos: 'Bancos e caixa 24h', correios: 'Correios', lavanderias: 'Lavanderias', tecnologia: 'Celular e informática',
  beleza: 'Cabeleireiro e barbearia', fotografos: 'Fotografia', contadores: 'Contabilidade', 'orgaos-publicos': 'Atendimento ao turista', materiais: 'Materiais de construção', ferragens: 'Ferramentas e ferragens', engenheiros: 'Engenharia e arquitetura', 'compra-venda': 'Imobiliárias',
}
const TIPO_LD = { restaurantes: 'Restaurant', pizzarias: 'Restaurant', hamburguerias: 'Restaurant', lanchonetes: 'Restaurant', cafeterias: 'CafeOrCoffeeShop', padarias: 'Bakery', bares: 'BarOrPub', pousadas: 'LodgingBusiness', atrativos: 'TouristAttraction', passeios: 'TouristAttraction', farmacias: 'Pharmacy', hospitais: 'Hospital', dentistas: 'Dentist', veterinarios: 'VeterinaryCare', postos: 'GasStation', oficinas: 'AutoRepair', supermercados: 'GroceryStore' }
const DIAS = { seg: 'Monday', ter: 'Tuesday', qua: 'Wednesday', qui: 'Thursday', sex: 'Friday', sab: 'Saturday', dom: 'Sunday' }
const DIAS_PT = { seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo' }

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const corta = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s }

async function supa(path) {
  try {
    const r = await fetch(`${SUPA}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }, signal: AbortSignal.timeout(5000) })
    return r.ok ? r.json() : []
  } catch { return [] }
}

function pagina({ titulo, descricao, url, imagem, corpo, ld, tipo = 'website' }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)}</title><meta name="description" content="${esc(descricao)}"><link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${tipo}"><meta property="og:site_name" content="Monte Verde MG"><meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(titulo)}"><meta property="og:description" content="${esc(descricao)}"><meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(imagem)}"><meta property="og:image:width" content="700"><meta property="og:image:height" content="525">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(titulo)}"><meta name="twitter:description" content="${esc(descricao)}"><meta name="twitter:image" content="${esc(imagem)}">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#121a15;background:#eef0ec}a{color:#2c6a45}img{max-width:100%;border-radius:16px}</style></head>
<body>${corpo}<p><a href="${esc(url)}">Abrir no guia Monte Verde MG</a></p></body></html>`
}

function horariosLD(b) {
  if (!b.hours) return undefined
  const out = []
  for (const [d, v] of Object.entries(b.hours)) {
    const m = String(v).match(/(\d{1,2})[:h](\d{2})?\s*[-–a]+\s*(\d{1,2})[:h]?(\d{2})?/)
    if (m && DIAS[d]) out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: DIAS[d], opens: `${m[1].padStart(2, '0')}:${m[2] || '00'}`, closes: `${m[3].padStart(2, '0')}:${m[4] || '00'}` })
  }
  return out.length ? out : undefined
}

export default async function handler(req, res) {
  const origem = `https://${req.headers['x-forwarded-host'] || req.headers.host}`
  const caminho = String(req.query.path || '/').split('?')[0]
  const q = new URL(req.url, origem).searchParams
  let html

  const mEst = caminho.match(/^\/estabelecimento\/([a-z0-9-]+)\/?$/)
  const mCat = caminho.match(/^\/categoria\/([a-z-]+)(?:\/([a-z-]+))?\/?$/)
  if (mEst) {
    const [b] = await supa(`businesses?slug=eq.${encodeURIComponent(mEst[1])}&status=eq.active&select=name,slug,description,category,subcategory,address,city,phone,whatsapp,hours,open_24h,latitude,longitude,website,verified_at,business_images(image_url,display_order)&limit=1`)
    if (!b) { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(pagina({ titulo: 'Página não encontrada · Monte Verde MG', descricao: 'Esse lugar não está no guia.', url: origem + caminho, imagem: FOTOS + 'mar-de-nuvens-p.webp', corpo: '<h1>Página não encontrada</h1>' })) }
    const cat = CATS[b.category] || ['', '', 'mar-de-nuvens']
    const sub = SUBS[b.subcategory] || cat[0]
    const foto = b.business_images?.sort((x, y) => x.display_order - y.display_order)[0]?.image_url
    const imagem = foto || `${FOTOS}${cat[2]}-p.webp`
    const local = [b.address, b.city || 'Monte Verde', 'MG'].filter(Boolean).join(', ')
    const descricao = corta(b.description ? `${b.description} ${sub} em ${b.city || 'Monte Verde'}.` : `${sub} em ${b.city || 'Monte Verde'}${b.address ? `, ${b.address}` : ''}. Telefone, WhatsApp, horário e rota no guia Monte Verde MG.`, 160)
    const url = `${origem}/estabelecimento/${b.slug}`
    const ld = { '@context': 'https://schema.org', '@type': TIPO_LD[b.subcategory] || 'LocalBusiness', name: b.name, description: b.description || undefined, url, image: imagem, telephone: b.phone || undefined, address: { '@type': 'PostalAddress', streetAddress: b.address || undefined, addressLocality: b.city || 'Monte Verde', addressRegion: 'MG', addressCountry: 'BR' }, geo: b.latitude ? { '@type': 'GeoCoordinates', latitude: b.latitude, longitude: b.longitude } : undefined, openingHoursSpecification: horariosLD(b), sameAs: b.website || undefined }
    const horas = b.hours ? '<h2>Horário</h2><ul>' + Object.entries(b.hours).map(([d, v]) => `<li>${DIAS_PT[d] || d}: ${esc(v)}</li>`).join('') + '</ul>' : ''
    const corpo = `<img src="${esc(imagem)}" alt=""><p>${esc(sub)} · Monte Verde, MG</p><h1>${esc(b.name)}</h1>${b.description ? `<p>${esc(b.description)}</p>` : ''}<p>${esc(local)}</p>${b.phone ? `<p>Telefone: ${esc(b.phone)}</p>` : ''}${horas}`
    html = pagina({ titulo: `${b.name} · ${sub} em Monte Verde`, descricao, url, imagem, corpo, ld, tipo: 'place' })
  } else if (mCat && CATS[mCat[1]]) {
    const [nome, desc, foto] = CATS[mCat[1]]
    const sub = mCat[2] && SUBS[mCat[2]] ? SUBS[mCat[2]] : null
    const lista = await supa(`businesses?category=eq.${mCat[1]}${mCat[2] ? `&subcategory=eq.${mCat[2]}` : ''}&status=eq.active&select=name,slug,subcategory,address&order=name`)
    const titulo = sub ? `${sub} em Monte Verde, MG` : `${nome} em Monte Verde: ${desc.split(' em ')[0].toLowerCase()}`
    const url = `${origem}${caminho}`
    const ld = { '@context': 'https://schema.org', '@type': 'ItemList', name: titulo, itemListElement: lista.slice(0, 100).map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, url: `${origem}/estabelecimento/${b.slug}` })) }
    const corpo = `<h1>${esc(sub || nome)} em Monte Verde</h1><p>${esc(desc)}. ${lista.length} lugares com telefone, WhatsApp, horário e rota.</p><ul>${lista.map(b => `<li><a href="/estabelecimento/${esc(b.slug)}">${esc(b.name)}</a>${b.address ? ` · ${esc(b.address)}` : ''}</li>`).join('')}</ul>`
    html = pagina({ titulo: `${titulo} · Monte Verde MG`, descricao: corta(`${desc}: ${lista.slice(0, 6).map(b => b.name).join(', ')} e mais. Horários, WhatsApp e rota.`, 160), url, imagem: `${FOTOS}${foto}-p.webp`, corpo, ld })
  } else if (caminho === '/roteiro') {
    html = pagina({ titulo: 'Roteiro de Monte Verde montado para você · Monte Verde MG', descricao: 'Diga quantos dias fica, com quem vem e do que gosta: manhã, almoço, tarde e jantar com lugares abertos. Edite e envie pelo WhatsApp.', url: `${origem}/roteiro`, imagem: `${FOTOS}serra-mantiqueira-p.webp`, corpo: '<h1>Seu roteiro em Monte Verde</h1><p>Um roteiro por dia, com lugares abertos, para editar e compartilhar.</p>' })
  } else if (caminho === '/busca' && q.get('q')) {
    const t = q.get('q')
    html = pagina({ titulo: `${t} em Monte Verde · Monte Verde MG`, descricao: `Onde encontrar ${t} em Monte Verde, MG, com quem está aberto agora.`, url: `${origem}/busca?q=${encodeURIComponent(t)}`, imagem: `${FOTOS}viela-lojas-p.webp`, corpo: `<h1>${esc(t)} em Monte Verde</h1>` })
  } else if (caminho === '/ofertas') {
    const lista = await supa('ofertas?ativo=eq.true&select=titulo,businesses(name,slug)&limit=20')
    html = pagina({ titulo: 'Ofertas em Monte Verde · Monte Verde MG', descricao: 'Ofertas dos estabelecimentos de Monte Verde para quem vem pelo guia: mostre a tela no balcão.', url: `${origem}/ofertas`, imagem: `${FOTOS}galeria-centro-p.webp`, corpo: `<h1>Ofertas em Monte Verde</h1><ul>${lista.map(o => `<li>${esc(o.titulo)} · <a href="/estabelecimento/${esc(o.businesses?.slug)}">${esc(o.businesses?.name)}</a></li>`).join('')}</ul>` })
  } else if (caminho === '/uteis' || caminho === '/sos') {
    html = pagina({ titulo: 'Farmácia, posto, caixa e emergência em Monte Verde · Monte Verde MG', descricao: 'Serviços úteis de Monte Verde com quem está aberto agora: farmácia, posto, mercado, caixa eletrônico, táxi, mecânico e emergência.', url: `${origem}${caminho}`, imagem: `${FOTOS}avenida-centro-p.webp`, corpo: '<h1>Serviços úteis em Monte Verde</h1>' })
  } else if (!['/', '/categorias', '/eventos', '/favoritos', '/mais', '/anuncie', '/anuncie/obrigado', '/creditos', '/meu-negocio', '/mapa', '/busca'].includes(caminho) && !/^\/(admin|evento\/)/.test(caminho)) {
    res.statusCode = 404
    html = pagina({ titulo: 'Página não encontrada · Monte Verde MG', descricao: 'Esse endereço não existe no guia.', url: origem + '/', imagem: FOTOS + 'mar-de-nuvens-p.webp', corpo: '<h1>Página não encontrada</h1>' })
  } else {
    const corpo = `<h1>Monte Verde MG: guia e roteiro da vila na serra</h1><p>O que está aberto agora, o que fazer, onde ficar e um roteiro montado para você.</p><ul>${Object.entries(CATS).map(([k, [n, d]]) => `<li><a href="/categoria/${k}">${esc(n)}</a>: ${esc(d)}</li>`).join('')}<li><a href="/roteiro">Montar meu roteiro</a></li><li><a href="/uteis">Serviços úteis</a></li><li><a href="/ofertas">Ofertas</a></li></ul>`
    const ld = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Monte Verde MG', url: origem, potentialAction: { '@type': 'SearchAction', target: `${origem}/busca?q={q}`, 'query-input': 'required name=q' } }
    html = pagina({ titulo: 'Monte Verde MG · guia e roteiro da vila na serra', descricao: 'Monte Verde, MG: onde comer agora, o que fazer, onde ficar e um roteiro montado para você. Guia local com horários reais.', url: origem + '/', imagem: `${FOTOS}mar-de-nuvens-p.webp`, corpo, ld })
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400')
  res.setHeader('Vary', 'User-Agent')
  res.end(html)
}
