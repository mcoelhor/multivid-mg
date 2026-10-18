import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, X } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'

const PERIODOS = [[7, '7 dias'], [30, '30 dias'], [90, '90 dias'], [365, '12 meses']]
const desde = d => new Date(Date.now() - d * 864e5).toISOString()

async function contar(kind, dias) {
  let q = supabase.from('interactions').select('id', { count: 'exact', head: true }).gte('created_at', desde(dias))
  q = Array.isArray(kind) ? q.in('kind', kind) : q.eq('kind', kind)
  const { count } = await q
  return count || 0
}

function Kpi({ rotulo, valor, sub, onClick }) {
  return (
    <button onClick={onClick} className="pressiona rounded-2xl bg-white p-3.5 text-left">
      <span className="block text-xs font-medium text-[#626a63]">{rotulo}</span>
      <span className="num mt-0.5 block text-2xl font-extrabold text-[var(--verde)]">{valor ?? '–'}</span>
      {sub && <span className="block text-[11px] text-[#8a918b]">{sub}</span>}
    </button>
  )
}

function Relatorio({ r, dias, onClose }) {
  const per = { 7: 'Nos últimos 7 dias', 30: 'Nos últimos 30 dias', 90: 'Nos últimos 90 dias', 365: 'Nos últimos 12 meses' }[dias]
  const msg = `Olá, ${r.name}! Aqui é do Portal Monte Verde (monteverdemg.com.br).\n\n${per}, a página de vocês no portal teve ${r.views} visitas de ${r.pessoas} pessoas e gerou ${r.contatos} contatos:\n• ${r.whatsapp} pelo WhatsApp\n• ${r.tel} ligações\n• ${r.rota} pedidos de rota ("como chegar")\n\nAs mensagens que chegam pelo portal começam com "Encontrei vocês no Portal Monte Verde", então dá para conferir na conversa.\n\nQuer que a gente coloque fotos, cardápio e destaque na sua categoria? Respondo por aqui.`
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-3" onClick={onClose}>
      <div className="entra w-full max-w-[460px] rounded-3xl bg-white p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold">{r.name}</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--creme)]" aria-label="Fechar"><X size={16} /></button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[['Visitas', r.views], ['WhatsApp', r.whatsapp], ['Ligações', r.tel], ['Rotas', r.rota]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[var(--creme)] p-2"><b className="num block text-lg">{v}</b><span className="text-[11px] text-[#626a63]">{k}</span></div>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold">Mensagem pronta para o comerciante</p>
        <textarea readOnly value={msg} rows={9} className="mt-1 w-full rounded-xl bg-[var(--creme)] p-3 text-[13px]" onFocus={e => e.target.select()} />
        <button onClick={() => navigator.clipboard?.writeText(msg)} className="botao botao-pri mt-2 w-full"><MessageCircle size={16} />Copiar mensagem</button>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [dias, setDias] = useState(30)
  const [k, setK] = useState({})
  const [rank, setRank] = useState(null)
  const [vazias, setVazias] = useState([])
  const [origens, setOrigens] = useState(null)
  const [aberto, setAberto] = useState(null)

  useEffect(() => {
    let vivo = true
    setRank(null)
    Promise.all([
      contar('view', dias), contar('whatsapp', dias), contar('tel', dias), contar('rota', dias),
      contar('busca', dias), contar('parceiro', dias),
      supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
      supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.rpc('ranking', { dias }),
      supabase.rpc('buscas', { dias, so_vazias: true }),
      supabase.rpc('origens', { dias }),
      contar('visita', dias),
      contar('cupom', dias),
    ]).then(([view, wa, tel, rota, busca, parc, leads, lugares, rk, bv, og, visitas, cupons]) => {
      if (!vivo) return
      setK({ view, wa, tel, rota, busca, parc, visitas, cupons, leads: leads.count || 0, lugares: lugares.count || 0 })
      setRank(rk.data || [])
      setVazias((bv.data || []).slice(0, 8))
      setOrigens(og.data || [])
    })
    return () => { vivo = false }
  }, [dias])

  return (
    <AdminLayout>
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
        {PERIODOS.map(([d, r]) => <button key={d} onClick={() => setDias(d)} className={`chip ${dias === d ? 'ativo' : ''}`}>{r}</button>)}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Kpi rotulo="Visitas" valor={k.visitas} sub="uma por aparelho por dia" />
        <Kpi rotulo="Leads aguardando" valor={k.leads} sub="toque para responder" onClick={() => navigate('/admin/leads')} />
        <Kpi rotulo="Contatos gerados" valor={k.wa == null ? null : k.wa + k.tel + k.rota} sub="WhatsApp + ligação + rota" />
        <Kpi rotulo="Visitas a lugares" valor={k.view} />
        <Kpi rotulo="Buscas" valor={k.busca} onClick={() => navigate('/admin/buscas')} />
        <Kpi rotulo="WhatsApp" valor={k.wa} />
        <Kpi rotulo="Ligações" valor={k.tel} />
        <Kpi rotulo="Ofertas usadas" valor={k.cupons} sub="mostradas no balcão" />
        <Kpi rotulo="Cliques nos parceiros" valor={k.parc} sub="Toca + Construtora" />
        <Kpi rotulo="Lugares ativos" valor={k.lugares} onClick={() => navigate('/admin/empresas')} />
      </div>

      <section className="mt-5 rounded-2xl bg-white p-4">
        <h2 className="font-bold">De onde vêm</h2>
        <p className="text-xs text-[#626a63]">Origem do primeiro acesso de cada aparelho: QR code e links com utm_source, Instagram, Google, app instalado ou direto.</p>
        {origens === null ? <div className="esqueleto mt-3 h-16 rounded-xl" /> : origens.length === 0 ? (
          <p className="mt-3 text-sm text-[#626a63]">Ainda sem visitas registradas no período.</p>
        ) : (
          <ul className="mt-2 divide-y divide-black/5">
            {origens.slice(0, 12).map(o => (
              <li key={o.source} className="flex items-center gap-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate font-semibold">{o.source}</span>
                <span className="num text-[#626a63]">{o.visitantes} {o.visitantes === 1 ? 'pessoa' : 'pessoas'}</span>
                <span className="num w-16 text-right font-bold text-[var(--verde)]">{o.cliques} <span className="text-[11px] font-medium text-[#626a63]">contatos</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-5 rounded-2xl bg-white p-4">
        <h2 className="font-bold">Mais procurados</h2>
        <p className="text-xs text-[#626a63]">Toque em um lugar para gerar o relatório do comerciante.</p>
        {rank === null ? <div className="esqueleto mt-3 h-24 rounded-xl" /> : rank.length === 0 ? (
          <p className="mt-3 text-sm text-[#626a63]">Ainda sem dados. Os números aparecem quando o app recebe visitas (a sua não conta).</p>
        ) : (
          <ol className="mt-2 divide-y divide-black/5">
            {rank.slice(0, 20).map((r, i) => (
              <li key={r.business_id}>
                <button onClick={() => setAberto(r)} className="flex w-full items-center gap-3 py-2.5 text-left">
                  <span className="num w-5 text-xs text-[#8a918b]">{i + 1}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{r.name}</span><span className="text-[11px] text-[#626a63]">{r.urgency_group} · {r.views} visitas</span></span>
                  <span className="num text-sm font-bold text-[var(--verde)]">{r.contatos}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      {vazias.length > 0 && (
        <section className="mt-3 rounded-2xl bg-white p-4">
          <h2 className="font-bold">Buscas sem resultado</h2>
          <p className="text-xs text-[#626a63]">É o que falta cadastrar.</p>
          <ul className="mt-2 space-y-1">{vazias.map(b => <li key={b.term} className="flex justify-between text-sm"><span>{b.term}</span><b className="num text-[#8a3b2e]">{b.vezes}</b></li>)}</ul>
        </section>
      )}

      {aberto && <Relatorio r={aberto} dias={dias} onClose={() => setAberto(null)} />}
    </AdminLayout>
  )
}
