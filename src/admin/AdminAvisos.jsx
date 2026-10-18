import { useEffect, useState } from 'react'
import { Megaphone, Trash2, Plus, Cloud } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'
import { useClima } from '../hooks/useClima'

const TIPOS = { info: 'Informação', alerta: 'Alerta (estrada, neblina)', evento: 'Evento' }
const VAZIO = { texto: '', link: '', tipo: 'info', fim: '' }
const local = d => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'sem fim')

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
    const { error } = await supabase.from('avisos').insert({ texto: f.texto.trim().slice(0, 160), link: f.link.trim() || null, tipo: f.tipo, fim: f.fim ? new Date(f.fim).toISOString() : null })
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
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select value={f.tipo} onChange={set('tipo')} className={campo}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <input type="datetime-local" value={f.fim} onChange={set('fim')} className={campo} title="Some sozinho nesta data" />
        </div>
        <input value={f.link} onChange={set('link')} placeholder="Link (opcional): /eventos, /uteis ou https://…" className={`${campo} mt-2`} />
        {msg && <p className="mt-2 text-[13px] font-semibold text-[var(--sos)]">{msg}</p>}
        <button className="botao botao-pri mt-3 w-full"><Plus size={16} />Publicar aviso</button>
      </form>

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
