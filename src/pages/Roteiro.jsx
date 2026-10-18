import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ArrowRight, Shuffle, Trash2, Navigation, Share2, Plus, RefreshCcw, X, Check, ChevronUp, ChevronDown, Pencil } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Selo } from '../components/UI/BusinessCard'
import { Icon } from '../components/UI/Icon'
import { useBusinesses } from '../hooks/useBusinesses'
import { FOTOS } from '../data/fotos'
import { agoraMV, DIAS, DIAS_NOME } from '../lib/horario'
import { linkRota, registrar } from '../lib/track'
import { COM_QUEM, GOSTOS, RITMOS, SLOTS, candidatos, montarRoteiro, alternativas, motivo, textoCompartilhar } from '../lib/roteiro'

const CHAVE = 'mv_roteiro_v1'
const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE)) } catch { return null } }
const gravar = v => { try { v ? localStorage.setItem(CHAVE, JSON.stringify(v)) : localStorage.removeItem(CHAVE) } catch { /* sem armazenamento */ } }

// O roteiro salvo guarda só ids; os lugares voltam do guia ao abrir.
const compacta = r => r.map(d => ({ dia: d.dia, paradas: d.paradas.map(p => ({ slot: p.slot, id: p.item.id })) }))
const expande = (r, porId) => r.map(d => ({ dia: d.dia, paradas: d.paradas.map(p => ({ slot: p.slot, item: porId.get(p.id) })).filter(p => p.item) }))

const nomeDia = (dia, k, inicio) => {
  const hoje = agoraMV().dia
  if (k === 0 && inicio === hoje) return 'Hoje'
  if (dia === (hoje + 1) % 7 && k <= 1) return 'Amanhã'
  return DIAS_NOME[DIAS[dia]]
}

function Opcoes({ titulo, itens, valor, multi, onChange }) {
  const ligado = id => (multi ? valor.includes(id) : valor === id)
  const troca = id => onChange(multi ? (ligado(id) ? valor.filter(x => x !== id) : [...valor, id]) : id)
  return (
    <fieldset className="revela mt-8 min-w-0">
      <legend className="text-[20px] font-extrabold tracking-[-0.02em]">{titulo}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {itens.map(([id, rot]) => (
          <button key={id} type="button" onClick={() => troca(id)} aria-pressed={ligado(id)} className="chip h-12 px-5 text-[16px]">
            {ligado(id) && <Check size={16} />}{rot}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function Perguntas({ perfil, setPerfil, onMontar }) {
  const hoje = agoraMV().dia
  const inicios = [0, 1, 2, 3, 4, 5, 6].map(k => (hoje + k) % 7).slice(0, 7)
  const set = k => v => setPerfil(p => ({ ...p, [k]: v }))
  return (
    <>
      <section className="relative">
        <img src={FOTOS.serra.g} srcSet={`${FOTOS.serra.p} 700w, ${FOTOS.serra.g} 1600w`} sizes="480px" alt={FOTOS.serra.legenda} className="deriva h-[44svh] min-h-[300px] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,14,12,0) 40%, rgba(10,14,12,.7) 100%)' }} />
        <h1 className="sobe titulo absolute bottom-6 left-5 right-5 text-white">Seu roteiro em Monte Verde</h1>
      </section>
      <div className="px-5 pt-6">
        <p className="text-[17px] leading-relaxed text-[var(--leve)]">Quatro respostas e montamos manhã, almoço, tarde e jantar com lugares abertos no dia da sua visita.</p>

        <fieldset className="mt-8 min-w-0">
          <legend className="text-[20px] font-extrabold tracking-[-0.02em]">Quantos dias?</legend>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(n => (
              <button key={n} type="button" onClick={() => set('dias')(n)} aria-pressed={perfil.dias === n} className="chip h-14 justify-center text-[20px] font-extrabold">{n}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8 min-w-0">
          <legend className="text-[20px] font-extrabold tracking-[-0.02em]">Começa quando?</legend>
          <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 scrollbar-hide">
            {inicios.map((d, k) => (
              <button key={d} type="button" onClick={() => set('inicio')(d)} aria-pressed={perfil.inicio === d} className="chip h-12 px-5 text-[16px]">
                {k === 0 ? 'Hoje' : k === 1 ? 'Amanhã' : DIAS_NOME[DIAS[d]]}
              </button>
            ))}
          </div>
        </fieldset>

        <Opcoes titulo="Com quem você vem?" itens={COM_QUEM} valor={perfil.comQuem} onChange={set('comQuem')} />
        <Opcoes titulo="Do que você gosta?" itens={GOSTOS} valor={perfil.gostos} multi onChange={set('gostos')} />
        <Opcoes titulo="Qual o ritmo?" itens={RITMOS} valor={perfil.ritmo} onChange={set('ritmo')} />

        <button onClick={onMontar} className="botao botao-pri mt-10 h-14 w-full text-[17px]">Montar meu roteiro <ArrowRight size={19} /></button>
      </div>
    </>
  )
}

function Parada({ p, dia, perfil, primeira, ultima, onTrocar, onRemover, onSubir, onDescer, i }) {
  const { item } = p
  const slot = SLOTS[p.slot]
  const lugar = item.tipo === 'lugar'
  return (
    <li className="entra relative pl-9" style={{ '--i': i }}>
      <span className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--araucaria)] text-[var(--broto)]"><Icon name={slot.icone} size={15} /></span>
      <p className="text-[14px] font-bold text-[var(--musgo)]">{slot.rotulo}</p>
      <div className="mt-1.5 overflow-hidden rounded-[var(--raio)] bg-[var(--papel)]">
        {item.foto && <img src={item.foto.p} alt={item.foto.legenda} loading="lazy" className="aspect-[16/8] w-full object-cover" />}
        <div className="flex gap-3.5 p-4">
          {lugar && !item.b.images?.[0] && <Selo b={item.b} tam={48} />}
          {lugar && item.b.images?.[0] && <img src={item.b.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-[14px] object-cover" />}
          <div className="min-w-0 flex-1">
            {lugar ? (
              <Link to={`/estabelecimento/${item.b.slug}`} className="block text-[19px] font-extrabold leading-tight tracking-[-0.02em]">{item.name}</Link>
            ) : (
              <h3 className="text-[19px] font-extrabold leading-tight tracking-[-0.02em]">{item.name}</h3>
            )}
            <p className="mt-1 text-[15px] leading-snug text-[var(--leve)]">{motivo(item, p.slot, dia, perfil)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 pb-2">
          <button onClick={onTrocar} className="botao botao-sec h-10 min-h-0 flex-1 px-3 text-[15px]"><Shuffle size={16} />Trocar</button>
          {lugar && (item.b.address || item.b.latitude) && (
            <a href={linkRota(item.b)} target="_blank" rel="noopener noreferrer" onClick={() => registrar('rota', { businessId: item.b.id })} className="botao botao-sec h-10 min-h-0 flex-1 px-3 text-[15px]"><Navigation size={16} />Rota</a>
          )}
          <button onClick={onSubir} disabled={primeira} className="botao h-10 min-h-0 w-10 px-0 text-[var(--leve)] disabled:opacity-30" aria-label="Subir"><ChevronUp size={19} /></button>
          <button onClick={onDescer} disabled={ultima} className="botao h-10 min-h-0 w-10 px-0 text-[var(--leve)] disabled:opacity-30" aria-label="Descer"><ChevronDown size={19} /></button>
          <button onClick={onRemover} className="botao h-10 min-h-0 w-10 px-0 text-[var(--leve)]" aria-label="Remover"><Trash2 size={17} /></button>
        </div>
      </div>
    </li>
  )
}

/** Folha que sobe de baixo para adicionar uma parada ao dia. */
function FolhaAdicionar({ aberta, onFechar, cands, dia, perfil, usados, onEscolher }) {
  const [slot, setSlot] = useState('tarde')
  const lista = useMemo(() => (aberta ? alternativas(cands, slot, dia, perfil, undefined, usados).slice(0, 12) : []), [aberta, cands, slot, dia, perfil, usados])
  useEffect(() => {
    if (!aberta) return
    const esc = e => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = '' }
  }, [aberta, onFechar])
  return createPortal(
    <>
      <div className={`fundo-folha fixed inset-0 z-[60] bg-black/45 ${aberta ? 'aberta' : ''}`} onClick={onFechar} />
      <div className={`folha fixed bottom-0 z-[61] max-h-[82svh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-[var(--nevoa)] pb-[calc(env(safe-area-inset-bottom)+20px)] min-[900px]:left-[max(6vw,calc(50vw-560px))] max-[899px]:left-1/2 max-[899px]:-translate-x-1/2 ${aberta ? 'aberta' : ''}`}
        role="dialog" aria-modal="true" aria-label="Adicionar parada">
        <div className="sticky top-0 z-10 bg-[var(--nevoa)] px-5 pb-3 pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-black/15" />
          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-[24px] font-extrabold tracking-[-0.03em]">Adicionar parada</h2>
            <button onClick={onFechar} className="botao h-10 min-h-0 w-10 px-0" aria-label="Fechar"><X size={20} /></button>
          </div>
          <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 scrollbar-hide">
            {Object.entries(SLOTS).map(([id, s]) => (
              <button key={id} onClick={() => setSlot(id)} aria-pressed={slot === id} className="chip">{s.rotulo}</button>
            ))}
          </div>
        </div>
        <ul className="space-y-2 px-5 pt-2">
          {lista.map(c => (
            <li key={c.id}>
              <button onClick={() => onEscolher(slot, c)} className="pressiona flex w-full items-center gap-3 rounded-[var(--raio)] bg-[var(--papel)] p-3 text-left">
                {c.tipo === 'lugar' ? <Selo b={c.b} tam={44} /> : <img src={c.foto.p} alt="" className="h-11 w-11 rounded-[12px] object-cover" />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-bold">{c.name}</span>
                  <span className="block truncate text-[14px] text-[var(--leve)]">{motivo(c, slot, dia, perfil)}</span>
                </span>
                <Plus size={20} className="shrink-0 text-[var(--musgo)]" />
              </button>
            </li>
          ))}
          {!lista.length && <p className="py-6 text-center text-[15px] text-[var(--leve)]">Nada aberto para este horário nesse dia.</p>}
        </ul>
      </div>
    </>,
    document.body,
  )
}

export function Roteiro() {
  const { businesses, loading } = useBusinesses({})
  const salvo = useMemo(ler, [])
  const [perfil, setPerfil] = useState(salvo?.perfil || { dias: 2, inicio: agoraMV().dia, comQuem: 'casal', gostos: ['comida'], ritmo: 'calmo', semente: 7 })
  const [compacto, setCompacto] = useState(salvo?.roteiro || null)
  const [diaAtivo, setDiaAtivo] = useState(0)
  const [folha, setFolha] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const cands = useMemo(() => candidatos(businesses), [businesses])
  const porId = useMemo(() => new Map(cands.map(c => [c.id, c])), [cands])
  const roteiro = useMemo(() => (compacto && porId.size ? expande(compacto, porId) : null), [compacto, porId])

  useEffect(() => { gravar(compacto ? { perfil, roteiro: compacto } : null) }, [compacto, perfil])

  const montar = (semente = perfil.semente) => {
    const p = { ...perfil, semente }
    setPerfil(p)
    setCompacto(compacta(montarRoteiro(businesses, p)))
    setDiaAtivo(0)
    registrar('busca', { term: `roteiro:${p.dias}d:${p.comQuem}:${p.gostos.join('+')}`, results: 1 })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const usados = useMemo(() => new Set(compacto?.flatMap(d => d.paradas.map(p => p.id)) || []), [compacto])
  const altera = fn => setCompacto(r => { const n = structuredClone(r); fn(n[diaAtivo].paradas); return n })

  const trocar = idx => {
    const atual = compacto[diaAtivo].paradas[idx]
    const dia = compacto[diaAtivo].dia
    const usadosMenosEste = new Set([...usados].filter(id => id !== atual.id))
    const alts = alternativas(cands, atual.slot, dia, perfil, undefined, usadosMenosEste)
    if (!alts.length) return
    const pos = alts.findIndex(c => c.id === atual.id)
    const prox = alts[(pos + 1) % alts.length]
    altera(ps => { ps[idx].id = prox.id })
  }

  if (!roteiro) {
    return (
      <Layout hideHeader>
        {loading ? <div className="esqueleto h-[44svh]" /> : <Perguntas perfil={perfil} setPerfil={setPerfil} onMontar={() => montar(Math.floor(Math.random() * 1e6))} />}
      </Layout>
    )
  }

  const d = roteiro[diaAtivo] || roteiro[0]
  const nomes = roteiro.map((x, k) => nomeDia(x.dia, k, perfil.inicio))
  const compartilhar = async () => {
    const texto = textoCompartilhar(roteiro, nomes)
    try {
      if (navigator.share) await navigator.share({ title: 'Meu roteiro em Monte Verde', text: texto })
      else { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }
    } catch { /* cancelado */ }
  }

  return (
    <Layout hideHeader>
      <section className="bg-[var(--araucaria)] px-5 pb-6 text-white" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 22px)' }}>
        <div className="flex items-start justify-between gap-3">
          <h1 className="titulo">Seu roteiro</h1>
          <button onClick={() => setCompacto(null)} className="botao h-11 min-h-0 bg-white/10 px-4 text-[15px] text-white"><Pencil size={16} />Refazer</button>
        </div>
        <p className="mt-2 text-[16px] text-white/70">
          {perfil.dias} {perfil.dias > 1 ? 'dias' : 'dia'} · {COM_QUEM.find(x => x[0] === perfil.comQuem)?.[1].toLowerCase()} · {RITMOS.find(x => x[0] === perfil.ritmo)?.[1].toLowerCase()}
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => montar(Math.floor(Math.random() * 1e6))} className="botao botao-broto h-12 min-h-0 flex-1 text-[15px]"><RefreshCcw size={17} />Outra sugestão</button>
          <button onClick={compartilhar} className="botao h-12 min-h-0 flex-1 bg-white/10 text-[15px] text-white"><Share2 size={17} />{copiado ? 'Copiado' : 'Enviar'}</button>
        </div>
      </section>

      <nav className="sticky top-0 z-30 flex gap-2 overflow-x-auto bg-[var(--nevoa)] px-5 py-3 scrollbar-hide" aria-label="Dias">
        {roteiro.map((x, k) => (
          <button key={k} onClick={() => setDiaAtivo(k)} aria-pressed={diaAtivo === k} className="chip h-11 px-5 text-[16px]">{nomes[k]}</button>
        ))}
      </nav>

      <ol key={diaAtivo} className="space-y-7 px-5 pt-4">
        {d.paradas.map((p, i) => (
          <Parada key={`${p.item.id}-${i}`} p={p} dia={d.dia} perfil={perfil} i={i}
            primeira={i === 0} ultima={i === d.paradas.length - 1}
            onTrocar={() => trocar(i)}
            onRemover={() => altera(ps => ps.splice(i, 1))}
            onSubir={() => altera(ps => ps.splice(i - 1, 2, ps[i], ps[i - 1]))}
            onDescer={() => altera(ps => ps.splice(i, 2, ps[i + 1], ps[i]))} />
        ))}
      </ol>

      <div className="px-5 pt-6">
        <button onClick={() => setFolha(true)} className="botao botao-sec h-14 w-full text-[16px]"><Plus size={19} />Adicionar parada em {nomes[diaAtivo].toLowerCase()}</button>
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--leve)]">
          Usamos o horário cadastrado de cada lugar. Em feriados e baixa temporada, ligue antes. Lugares marcados como Destaque ou Parceiro são anunciantes do guia.
        </p>
      </div>

      <FolhaAdicionar aberta={folha} onFechar={() => setFolha(false)} cands={cands} dia={d.dia} perfil={perfil} usados={usados}
        onEscolher={(slot, c) => {
          const ordem = Object.keys(SLOTS)
          altera(ps => {
            const pos = ps.findIndex(x => ordem.indexOf(x.slot) > ordem.indexOf(slot))
            ps.splice(pos === -1 ? ps.length : pos, 0, { slot, id: c.id })
          })
          setFolha(false)
        }} />
    </Layout>
  )
}
