import { Link } from 'react-router-dom'
import { Siren, ArrowRight, Phone, Map } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Icon } from '../components/UI/Icon'
import { StatusPill } from '../components/UI/Badge'
import { useBusinesses, ordenar } from '../hooks/useBusinesses'
import { agoraMV, DIAS, DIAS_NOME, hhmm } from '../lib/horario'
import { linkTel, registrar } from '../lib/track'

// O que o turista precisa resolver, na ordem em que costuma precisar.
const LINHAS = [
  ['Farmácia', 'Pill', ['farmacias'], '/categoria/saude/farmacias'],
  ['Posto de gasolina', 'Fuel', ['postos'], '/categoria/transporte/postos'],
  ['Mercado', 'ShoppingCart', ['supermercados'], '/categoria/compras/supermercados'],
  ['Caixa eletrônico', 'Landmark', ['bancos'], '/categoria/servicos/bancos'],
  ['Táxi', 'CarTaxiFront', ['taxis'], '/categoria/transporte/taxis'],
  ['Mecânico e borracharia', 'Wrench', ['oficinas', 'borracharias'], '/categoria/transporte'],
  ['Médico e dentista', 'Stethoscope', ['pronto-socorro', 'clinicas', 'dentistas', 'hospitais'], '/categoria/saude'],
  ['Veterinário e pet shop', 'PawPrint', ['veterinarios', 'pet-shops'], '/busca?q=pet'],
  ['Correios', 'Mail', ['correios'], '/categoria/servicos/correios'],
  ['Lavanderia', 'WashingMachine', ['lavanderias'], '/categoria/servicos/lavanderias'],
  ['Celular e informática', 'Laptop', ['tecnologia'], '/categoria/servicos/tecnologia'],
  ['Atendimento ao turista', 'Info', ['orgaos-publicos'], '/categoria/servicos/orgaos-publicos'],
]

/** Serviços úteis: o que resolve um problema durante a viagem, com quem está aberto agora. */
export function Uteis() {
  const { businesses, loading } = useBusinesses({})
  const a = agoraMV()
  const porSub = subs => ordenar(businesses.filter(b => subs.includes(b.subcategory)))

  return (
    <Layout title="Úteis" subtitle={`${DIAS_NOME[DIAS[a.dia]]}, ${hhmm(a.min)} em Monte Verde`}>
      <div className="px-5">
        <Link to="/sos" className="pressiona flex items-center gap-3 rounded-[var(--raio)] bg-[var(--sos)] px-5 py-4 text-white">
          <Siren size={22} className="shrink-0" />
          <span className="flex-1">
            <span className="block text-[17px] font-bold leading-tight">Emergência</span>
            <span className="num block text-[14px] text-white/90">Pronto-socorro, 190 · 192 · 193</span>
          </span>
          <ArrowRight size={20} className="shrink-0" />
        </Link>

        {loading ? (
          <div className="mt-4 space-y-2">{[0, 1, 2, 3].map(i => <div key={i} className="esqueleto h-20 rounded-[var(--raio)]" />)}</div>
        ) : (
          <ul className="mt-4 space-y-2">
            {LINHAS.map(([rotulo, icone, subs, to], i) => {
              const itens = porSub(subs)
              if (!itens.length) return null
              const abertos = itens.filter(b => b.st.estado === 'aberto' || b.st.estado === 'plantao')
              const primeiro = abertos[0] || itens[0]
              const semHorario = itens.every(b => b.st.estado === 'desconhecido')
              return (
                <li key={rotulo} className="entra overflow-hidden rounded-[var(--raio)] bg-[var(--papel)]" style={{ '--i': i }}>
                  <Link to={to} className="pressiona flex items-center gap-3.5 px-4 pt-4 pb-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--araucaria)] text-[var(--broto)]"><Icon name={icone} size={21} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[18px] font-extrabold leading-tight tracking-[-0.02em]">{rotulo}</span>
                      <span className="block text-[14px] text-[var(--leve)]">
                        {itens.length} {itens.length === 1 ? 'lugar' : 'lugares'}{abertos.length ? ` · ${abertos.length} abertos agora` : semHorario ? ' · horários a confirmar' : ' · nenhum aberto agora'}
                      </span>
                    </span>
                    <ArrowRight size={18} className="shrink-0 text-[var(--musgo)]" />
                  </Link>
                  <div className="flex items-center gap-2 px-4 pb-3 pl-[76px]">
                    <Link to={`/estabelecimento/${primeiro.slug}`} className="flex min-h-11 min-w-0 flex-1 items-center truncate text-[15px] font-semibold">{primeiro.name}</Link>
                    <StatusPill st={primeiro.st} />
                    {primeiro.phone && (
                      <a href={linkTel(primeiro.phone)} onClick={() => registrar('tel', { businessId: primeiro.id })} className="botao botao-pri h-10 min-h-0 px-3.5 text-[14px]" aria-label={`Ligar para ${primeiro.name}`}><Phone size={15} />Ligar</a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <Link to="/mapa" className="mt-6 flex min-h-12 items-center gap-2 text-[16px] font-bold text-[var(--musgo)]"><Map size={18} />Ver no mapa</Link>
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--leve)]">Horários vêm do cadastro de cada lugar. Em feriados, ligue antes. Viu algo errado? <Link to="/mais#corrigir" className="font-semibold underline underline-offset-4">Avise a gente</Link>.</p>
      </div>
    </Layout>
  )
}
