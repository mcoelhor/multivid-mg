import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, Loader2, X, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

const campo = 'mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]'
const HORAS = (() => { const l = []; for (let h = 8; h <= 20; h++) for (let m = 0; m < 60; m += 5) l.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`); return l })()
// Depois das 17h o padrão já é amanhã, para o horário sugerido (18h) não cair no passado
const diaPadrao = () => { const h = Number(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' })); return new Date(Date.now() + (h >= 17 ? 86400e3 : 0)).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }) }
const quando = d => new Date(d).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

/** Notificação agendada pelo anunciante: o dono escolhe o texto e o horário; a fila solta uma loja a cada 5 minutos. */
export function NotificacoesDono({ b }) {
  const [info, setInfo] = useState(null)
  const [lista, setLista] = useState([])
  const [f, setF] = useState({ texto: '', dia: diaPadrao(), hora: '18:00' })
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = () => {
    supabase.rpc('minhas_campanhas', { p_business: b.id }).then(({ data }) => setInfo(data?.[0] || { cota: 0, usadas: 0, alcance: 0 }))
    supabase.from('push_campanhas').select('id,texto,agendado_para,status,enviados').eq('business_id', b.id).order('agendado_para', { ascending: false }).limit(10).then(({ data }) => setLista(data || []))
  }
  useEffect(carregar, [b.id])

  const dias = useMemo(() => Array.from({ length: 14 }, (_, k) => {
    const d = new Date(Date.now() + k * 86400e3)
    return [d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' }), k === 0 ? 'Hoje' : k === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: '2-digit' })]
  }), [])

  async function agendar(e) {
    e.preventDefault(); setMsg('')
    const t = f.texto.trim()
    if (t.length < 10) { setMsg('Escreva a mensagem (pelo menos 10 caracteres).'); return }
    setEnviando(true)
    const { error } = await supabase.rpc('agendar_notificacao', { p_business: b.id, p_texto: t, p_quando: new Date(`${f.dia}T${f.hora}:00-03:00`).toISOString() })
    setEnviando(false)
    if (error) { setMsg(error.message.replace(/^.*?:\s*/, '') || 'Não foi possível agendar.'); return }
    setF(v => ({ ...v, texto: '' })); setMsg('ok'); carregar()
  }
  async function cancelar(c) {
    if (!confirm('Cancelar esta notificação?')) return
    await supabase.rpc('cancelar_notificacao', { p_id: c.id }); carregar()
  }

  if (!info) return <div className="esqueleto mt-8 h-32 rounded-[var(--raio)]" />

  if (!info.cota) {
    return (
      <section className="mt-8 rounded-[var(--raio)] bg-[var(--araucaria)] p-5 text-white">
        <h3 className="flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.02em]"><BellRing size={19} className="text-[var(--broto)]" />Avise os turistas no celular</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-white/80">Com os planos Destaque e Parceiro você agenda uma notificação, por exemplo "Hoje às 18h, 10% no fondue", e ela chega no celular de quem está com o guia. {info.alcance > 0 ? <>Hoje são <b className="text-white">{info.alcance}</b> pessoas com notificações ligadas.</> : null}</p>
        <Link to="/anuncie#planos" className="botao botao-broto mt-4 w-full">Ver os planos <ArrowRight size={18} /></Link>
      </section>
    )
  }

  const restantes = Math.max(0, info.cota - info.usadas)
  return (
    <section className="mt-8 rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <h3 className="flex items-center gap-2 text-[18px] font-extrabold tracking-[-0.02em]"><BellRing size={19} className="text-[var(--musgo)]" />Notificação para os turistas</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-[var(--leve)]">
        Chega no celular de quem ligou os avisos do guia ({info.alcance} {info.alcance === 1 ? 'pessoa' : 'pessoas'} hoje). Seu plano permite <b className="text-[var(--araucaria)]">{info.cota} por semana</b>; restam {restantes}.
        As lojas saem uma de cada vez, a cada 5 minutos: se outra marcou o mesmo horário, a sua sai logo em seguida. Cada pessoa recebe no máximo 2 avisos de lojas por dia, das 8h às 21h.
      </p>

      {lista.length > 0 && (
        <ul className="mt-4 space-y-2">
          {lista.map(c => (
            <li key={c.id} className={`flex items-start gap-3 rounded-2xl bg-[var(--nevoa)] p-3.5 ${c.status === 'cancelada' ? 'opacity-60' : ''}`}>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug">{c.texto}</p>
                <p className="mt-1 text-[13px] text-[var(--leve)]">{quando(c.agendado_para)} · {c.status === 'agendada' ? 'agendada' : c.status === 'enviada' ? <>enviada para <b className="num text-[var(--araucaria)]">{c.enviados}</b> {c.enviados === 1 ? 'pessoa' : 'pessoas'}</> : 'cancelada'}</p>
              </div>
              {c.status === 'agendada' && <button onClick={() => cancelar(c)} className="botao botao-sec h-9 min-h-0 w-9 shrink-0 px-0" aria-label="Cancelar notificação"><X size={15} /></button>}
            </li>
          ))}
        </ul>
      )}

      {restantes > 0 ? (
        <form onSubmit={agendar} className="mt-4">
          <label className="block text-[15px] font-bold" htmlFor="nt">Mensagem <span className="font-medium text-[var(--leve)]">({f.texto.length}/120)</span></label>
          <textarea id="nt" rows={2} maxLength={120} value={f.texto} onChange={e => setF(v => ({ ...v, texto: e.target.value }))} placeholder="Ex.: Hoje às 18h, 10% de desconto no fondue para quem vier pelo guia" className={campo} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-[15px] font-bold">Dia
              <select value={f.dia} onChange={e => setF(v => ({ ...v, dia: e.target.value }))} className={campo}>{dias.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
            </label>
            <label className="text-[15px] font-bold">Horário
              <select value={f.hora} onChange={e => setF(v => ({ ...v, hora: e.target.value }))} className={campo}>{HORAS.map(h => <option key={h} value={h}>{h}</option>)}</select>
            </label>
          </div>
          {f.texto.trim().length >= 10 && (
            <div className="mt-4 rounded-2xl bg-[var(--araucaria)] p-3.5 text-white" aria-label="Prévia da notificação">
              <p className="text-[12px] text-white/60">Prévia no celular</p>
              <p className="mt-1 text-[15px] font-bold leading-tight">{b.name}</p>
              <p className="text-[14px] leading-snug text-white/85">{f.texto.trim()}</p>
            </div>
          )}
          {msg && <p className={`mt-3 text-[15px] font-semibold ${msg === 'ok' ? 'text-[var(--musgo)]' : 'text-[var(--sos)]'}`} role="status">{msg === 'ok' ? 'Agendada. Ela aparece na lista acima.' : msg}</p>}
          <button disabled={enviando} className="botao botao-pri mt-4 h-12 w-full">{enviando ? <Loader2 size={18} className="animate-spin" /> : 'Agendar notificação'}</button>
        </form>
      ) : (
        <p className="mt-4 rounded-2xl bg-[var(--nevoa)] p-3.5 text-[14px] text-[var(--leve)]">Você já usou as notificações desta semana. {info.cota === 1 ? 'No plano Parceiro são 3 por semana.' : ''}</p>
      )}
    </section>
  )
}
