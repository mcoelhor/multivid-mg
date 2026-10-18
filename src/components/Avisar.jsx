import { useState } from 'react'
import { Bell, BellRing, Check, Loader2 } from 'lucide-react'
import { assinar, avisarQuandoAbrir, jaPediuAviso, assinaturaLocal, suportaPush, precisaInstalar, dataDoDia } from '../lib/push'
import { registrar } from '../lib/track'

const dataPt = iso => { const [a, m, d] = iso.split('-'); return `${d}/${m}` }

/** Cartão do roteiro: "me avise quando chegar", com véspera e manhã de cada dia. */
export function AvisarChegada({ perfil }) {
  const chegada = dataDoDia(perfil.inicio)
  const local = assinaturaLocal()
  const [estado, setEstado] = useState(local?.chegada === chegada ? 'ok' : '')
  const [msg, setMsg] = useState('')
  if (!chegada) return null
  const pode = suportaPush() && !precisaInstalar()
  async function ligar() {
    setEstado('enviando'); setMsg('')
    try { await assinar({ chegada, dias: perfil.dias }); registrar('lead', { term: 'push:chegada' }); setEstado('ok') } catch (e) { setEstado('erro'); setMsg(e.message) }
  }
  if (estado === 'ok') {
    return (
      <div className="mx-5 mt-4 flex items-start gap-3 rounded-[var(--raio)] bg-[var(--papel)] p-4">
        <BellRing size={20} className="mt-0.5 shrink-0 text-[var(--musgo)]" />
        <p className="text-[15px] leading-snug"><b>Avisos ligados.</b> Na véspera ({dataPt(chegada)} às 18h) mando a previsão; na manhã de cada dia, o tempo e o que está aberto.</p>
      </div>
    )
  }
  return (
    <div className="mx-5 mt-4 rounded-[var(--raio)] bg-[var(--papel)] p-4">
      <div className="flex items-start gap-3">
        <Bell size={20} className="mt-0.5 shrink-0 text-[var(--musgo)]" />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold leading-tight">Me avise quando eu chegar</p>
          <p className="mt-1 text-[14px] leading-snug text-[var(--leve)]">Na véspera, a previsão do tempo. Na manhã do dia {dataPt(chegada)} e dos seguintes, o que está aberto. Sem cadastro.</p>
        </div>
      </div>
      {!pode && precisaInstalar() && <p className="mt-3 text-[14px] leading-snug text-[var(--leve)]">No iPhone: toque em Compartilhar → <b>Adicionar à Tela de Início</b> e abra o app por lá para ligar os avisos.</p>}
      {!pode && !precisaInstalar() && <p className="mt-3 text-[14px] text-[var(--leve)]">Este navegador não recebe avisos. Tente o Chrome.</p>}
      {pode && <button onClick={ligar} disabled={estado === 'enviando'} className="botao botao-pri mt-3 h-11 min-h-0 w-full text-[15px]">{estado === 'enviando' ? <Loader2 size={17} className="animate-spin" /> : <><Bell size={16} />Ligar avisos</>}</button>}
      {msg && <p className="mt-2 text-[14px] font-semibold text-[var(--sos)]">{msg}</p>}
    </div>
  )
}

/** Botão da página do lugar: "avisar quando abrir". Só aparece com horário cadastrado e lugar fechado. */
export function AvisarAbertura({ b }) {
  const [estado, setEstado] = useState(jaPediuAviso(b.id) ? 'ok' : '')
  const [msg, setMsg] = useState('')
  if (!b.hours || b.st?.estado === 'aberto' || b.st?.estado === 'desconhecido') return null
  async function ligar() {
    setEstado('enviando'); setMsg('')
    try { await avisarQuandoAbrir(b.id); registrar('lead', { term: 'push:abrir', businessId: b.id }); setEstado('ok') } catch (e) { setEstado('erro'); setMsg(e.message) }
  }
  return (
    <div className="mt-2">
      <button onClick={ligar} disabled={estado === 'ok' || estado === 'enviando'} className={`botao h-11 min-h-0 w-full text-[15px] ${estado === 'ok' ? 'botao-sec' : 'botao-claro'}`}>
        {estado === 'enviando' ? <Loader2 size={17} className="animate-spin" /> : estado === 'ok' ? <><Check size={16} />Vamos avisar quando abrir</> : <><Bell size={16} />Avisar quando abrir</>}
      </button>
      {msg && <p className="mt-2 text-[14px] font-semibold text-[var(--sos)]">{msg}</p>}
    </div>
  )
}
