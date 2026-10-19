import { useEffect, useState } from 'react'
import { Megaphone, Trash2, Plus, Cloud, BellRing } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'
import { useClima } from '../hooks/useClima'

const TIPOS = { info: 'Informação', alerta: 'Alerta (estrada, neblina)', evento: 'Evento' }
const VAZIO = { texto: '', link: '', tipo: 'info', inicio: '', fim: '' }
const local = d => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'sem fim')

/** IDs do pixel da Meta e da tag do Google. Só carregam no app depois do consentimento de cookies. */
function Marketing() {
  const [c, setC] = useState({ meta_pixel_id: '', google_tag_id: '' })
  const [msg, setMsg] = useState('')
  useEffect(() => { supabase.from('config').select('chave,valor').in('chave', ['meta_pixel_id', 'google_tag_id']).then(({ data }) => setC(v => ({ ...v, ...Object.fromEntries((data || []).map(x => [x.chave, x.valor])) }))) }, [])
  async function salvar() {
    const linhas = [['meta_pixel_id', c.meta_pixel_id.replace(/\D/g, '')], ['google_tag_id', c.google_tag_id.trim().toUpperCase()]].map(([chave, valor]) => ({ chave, valor, atualizado_em: new Date().toISOString() }))
    const { error } = await supabase.from('config').upsert(linhas)
    setMsg(error ? 'Erro ao salvar' : 'Salvo'); setTimeout(() => setMsg(''), 2000)
  }
  return (
    <section className="mt-4 rounded-2xl bg-white p-4">
      <h2 className="font-bold">Anúncios e remarketing</h2>
      <p className="mt-1 text-[13px] text-[#626a63]">Cole os IDs quando criar as contas. O app passa a pedir consentimento de cookies e a enviar os eventos contato, lead, roteiro e lugar visto. Com o pixel da Meta você anuncia no Instagram para quem está em Monte Verde e para quem já abriu o guia.</p>
      <label className="mt-3 block text-[13px] font-bold">Meta Pixel ID (só números)</label>
      <input value={c.meta_pixel_id || ''} onChange={e => setC(v => ({ ...v, meta_pixel_id: e.target.value }))} inputMode="numeric" placeholder="ex.: 123456789012345" className="mt-1 w-full rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm" />
      <label className="mt-3 block text-[13px] font-bold">Google tag (G-XXXX, AW-XXXX ou GT-XXXX)</label>
      <input value={c.google_tag_id || ''} onChange={e => setC(v => ({ ...v, google_tag_id: e.target.value }))} placeholder="ex.: G-ABC123DEF4" className="mt-1 w-full rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm" />
      <button onClick={salvar} className="botao botao-pri mt-3 h-10 min-h-0 w-full text-[14px]">{msg || 'Salvar'}</button>
    </section>
  )
}

/** Fila de notificações dos anunciantes: o admin vê o que vai sair e pode cancelar. */
function FilaNotificacoes() {
  const [lista, setLista] = useState(null)
  const carregar = () => supabase.from('push_campanhas').select('id,texto,agendado_para,status,enviados,businesses(name)').order('agendado_para', { ascending: false }).limit(30).then(({ data }) => setLista(data || []))
  useEffect(() => { carregar() }, [])
  async function cancelar(c) { if (confirm('Cancelar esta notificação?')) { await supabase.rpc('cancelar_notificacao', { p_id: c.id }); carregar() } }
  return (
    <section className="mt-4 rounded-2xl bg-white p-4">
      <h2 className="flex items-center gap-2 font-bold"><BellRing size={18} className="text-[var(--verde)]" />Notificações dos anunciantes</h2>
      <p className="mt-1 text-[13px] text-[#626a63]">Agendadas pelos donos (Destaque: 1 por semana, Parceiro: 3). Saem uma a cada 5 minutos, das 8h às 21h; cada aparelho recebe no máximo 2 por dia.</p>
      {lista === null ? <div className="esqueleto mt-2 h-14 rounded-xl" /> : lista.length === 0 ? <p className="mt-2 text-sm text-[#626a63]">Nenhuma ainda.</p> : (
        <ul className="mt-2 space-y-2">
          {lista.map(c => (
            <li key={c.id} className={`rounded-xl bg-[var(--creme)] p-3 ${c.status === 'cancelada' ? 'opacity-60' : ''}`}>
              <p className="text-[13px] font-bold">{c.businesses?.name}</p>
              <p className="text-sm">{c.texto}</p>
              <p className="mt-1 flex items-center justify-between text-[12px] text-[#626a63]">
                <span>{local(c.agendado_para)} · {c.status}{c.status === 'enviada' ? ` · ${c.enviados} pessoas` : ''}</span>
                {c.status === 'agendada' && <button onClick={() => cancelar(c)} className="font-semibold text-[var(--sos)]">Cancelar</button>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Avisos da vila: uma linha no topo da home. Expiram sozinhos na data marcada. */
export function AdminAvisos() {
  const [lista, setLista] = useState(null)
  const [f, setF] = useState(VAZIO)
  const [msg, setMsg] = useState('')
  const clima = useClima()
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))
  const carregar = () => supabase.from('avisos').select('*').order('criado_em', { ascending: false }).limit(50).then(({ data }) => setLista(data || []))
  useEffect(() => { carregar() }, [])

  async function criar(e) {
    e.preventDefault()
    if (f.texto.trim().length < 5) { setMsg('Escreva o aviso.'); return }
    const { error } = await supabase.from('avisos').insert({ texto: f.texto.trim().slice(0, 160), link: f.link.trim() || null, tipo: f.tipo, inicio: f.inicio ? new Date(f.inicio).toISOString() : new Date().toISOString(), fim: f.fim ? new Date(f.fim).toISOString() : null })
    if (error) { setMsg(error.message); return }
    setF(VAZIO); setMsg(''); carregar()
  }
  async function alternar(a) { await supabase.from('avisos').update({ ativo: !a.ativo }).eq('id', a.id); carregar() }
  async function apagar(a) { if (confirm('Apagar este aviso?')) { await supabase.from('avisos').delete().eq('id', a.id); carregar() } }
  const campo = 'w-full rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm'

  return (
    <AdminLayout>
      {clima && (
        <section className="rounded-2xl bg-white p-4">
          <h2 className="flex items-center gap-2 font-bold"><Cloud size={18} className="text-[var(--verde)]" />Clima agora (Open-Meteo)</h2>
          <p className="mt-1 text-sm">{clima.temp} °C, {clima.texto} · hoje {clima.min}–{clima.max} °C · chuva {clima.probHoje}%{clima.amanha ? ` · amanhã ${clima.amanha.texto}, ${clima.amanha.min}–${clima.amanha.max} °C, chuva ${clima.amanha.prob}%` : ''}</p>
          {clima.marDeNuvens && (
            <p className="mt-2 rounded-xl bg-[var(--creme)] px-3 py-2 text-[13px]">
              <b>Mar de nuvens amanhã às 6h: {clima.marDeNuvens.nivel}</b> ({clima.marDeNuvens.pontos} de 4 sinais: umidade {clima.marDeNuvens.umid}%, vento {Math.round(clima.marDeNuvens.vento)} km/h, nuvens {clima.marDeNuvens.nuvem}%, {clima.marDeNuvens.temp} °C{clima.marDeNuvens.chuvaMadrugada ? ', chuva de madrugada' : ''}). Compare com o que acontece por uma semana antes de mostrar ao público.
            </p>
          )}
          <p className="mt-2 text-[12px] text-[#8a918b]">A home já mostra temperatura, Plano B de chuva e aviso de frio automaticamente.</p>
        </section>
      )}

      <form onSubmit={criar} className="mt-4 rounded-2xl bg-white p-4">
        <h2 className="flex items-center gap-2 font-bold"><Megaphone size={18} className="text-[var(--verde)]" />Novo aviso</h2>
        <p className="mt-1 text-[13px] text-[#626a63]">Aparece no topo da home para todo mundo. Exemplos: "Festival de Inverno neste fim de semana", "Neblina forte na serra: vá devagar", "Centro fechado para carros no feriado".</p>
        <input value={f.texto} onChange={set('texto')} maxLength={160} placeholder="Texto do aviso (até 160 caracteres)" className={`${campo} mt-3`} />
        <select value={f.tipo} onChange={set('tipo')} className={`${campo} mt-2`}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-[12px] text-[#626a63]">Começa em (vazio = agora)<input type="datetime-local" value={f.inicio} onChange={set('inicio')} className={campo} /></label>
          <label className="text-[12px] text-[#626a63]">Some em (vazio = nunca)<input type="datetime-local" value={f.fim} onChange={set('fim')} className={campo} /></label>
        </div>
        <input value={f.link} onChange={set('link')} placeholder="Link (opcional): /eventos, /uteis ou https://…" className={`${campo} mt-2`} />
        {msg && <p className="mt-2 text-[13px] font-semibold text-[var(--sos)]">{msg}</p>}
        <button className="botao botao-pri mt-3 w-full"><Plus size={16} />Publicar aviso</button>
      </form>

      <FilaNotificacoes />
      <Marketing />

      <h2 className="mt-5 font-bold">Avisos</h2>
      {lista === null ? <div className="esqueleto mt-2 h-20 rounded-2xl" /> : lista.length === 0 ? <p className="mt-2 text-sm text-[#626a63]">Nenhum aviso ainda.</p> : (
        <ul className="mt-2 space-y-2">
          {lista.map(a => (
            <li key={a.id} className={`rounded-2xl bg-white p-4 ${a.ativo ? '' : 'opacity-60'}`}>
              <p className="text-sm font-semibold">{a.texto}</p>
              <p className="mt-1 text-[12px] text-[#626a63]">{TIPOS[a.tipo]} · até {local(a.fim)}{a.link ? ` · ${a.link}` : ''}{a.fim && new Date(a.fim) < new Date() ? ' · expirado' : ''}</p>
              <div className="mt-2 flex gap-2">
                <button onClick={() => alternar(a)} className="botao botao-sec h-9 min-h-0 flex-1 text-[13px]">{a.ativo ? 'Desativar' : 'Ativar'}</button>
                <button onClick={() => apagar(a)} className="botao botao-sec h-9 min-h-0 w-10 px-0" aria-label="Apagar"><Trash2 size={15} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminLayout>
  )
}
