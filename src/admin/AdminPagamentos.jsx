import { useEffect, useMemo, useState } from 'react'
import { MessageCircle, Check } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'
import { useBusinesses } from '../hooks/useBusinesses'

const NOME = { destaque: 'Destaque', premium: 'Parceiro' }
const ST = { pendente: ['Aguardando', '#b98a2e'], aprovado: ['Pago', '#2c6a45'], recusado: ['Recusado', '#8a3b2e'], cancelado: ['Cancelado', '#5a625c'], estornado: ['Estornado', '#8a3b2e'] }
const reais = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const data = d => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')

function Pedido({ p, lugares, onAtivar }) {
  const [neg, setNeg] = useState(p.business_id || '')
  const [enviando, setEnviando] = useState(false)
  let wa = (p.contato_whatsapp || '').replace(/\D/g, ''); if (wa.length === 11 || wa.length === 10) wa = '55' + wa
  const msg = `Olá${p.contato_nome ? `, ${p.contato_nome.split(' ')[0]}` : ''}! Aqui é do Monte Verde MG. Recebemos seu pedido do plano ${NOME[p.plano]} para ${p.nome_negocio}.`
  const [rot, cor] = ST[p.status] || [p.status, '#5a625c']
  return (
    <li className="rounded-[var(--raio)] bg-[var(--papel)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[17px] font-extrabold leading-tight">{p.nome_negocio}</p>
          <p className="text-[14px] text-[var(--leve)]">Plano {NOME[p.plano]} · {reais(p.valor)} · {data(p.criado_em)}{p.metodo ? ` · ${p.metodo}` : ''}</p>
          {p.status === 'aprovado' && <p className="text-[14px] font-semibold text-[var(--musgo)]">Ativo até {data(p.vigente_ate)}</p>}
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-1 text-[13px] font-bold text-white" style={{ background: cor }}>{rot}</span>
      </div>
      <div className="mt-3 flex gap-2">
        {wa.length >= 12 && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" className="botao botao-wa h-10 min-h-0 flex-1 text-[15px]"><MessageCircle size={16} />{p.contato_nome || 'WhatsApp'}</a>}
      </div>
      {(p.status === 'pendente' || !p.business_id) && (
        <div className="mt-3 space-y-2">
          <select value={neg} onChange={e => setNeg(e.target.value)} className="w-full rounded-2xl bg-[var(--nevoa)] px-3 py-3 text-[15px]">
            <option value="">Ligar a qual página do guia?</option>
            {lugares.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {p.status === 'pendente' && (
            <button disabled={!neg || enviando} onClick={async () => { setEnviando(true); await onAtivar(p.id, neg); setEnviando(false) }} className="botao botao-pri h-11 min-h-0 w-full text-[15px] disabled:opacity-50">
              <Check size={17} />Recebi o pagamento: ativar plano
            </button>
          )}
        </div>
      )}
    </li>
  )
}

export function AdminPagamentos() {
  const [lista, setLista] = useState(null)
  const [erro, setErro] = useState('')
  const { businesses } = useBusinesses({})
  const lugares = useMemo(() => [...businesses].filter(b => b.category !== 'emergencia').sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [businesses])

  const carregar = () => supabase.from('pagamentos').select('*').order('criado_em', { ascending: false }).limit(200)
    .then(({ data, error }) => { if (error) setErro(error.message); setLista(data || []) })
  useEffect(() => { carregar() }, [])

  const ativar = async (id, business) => {
    const { error } = await supabase.rpc('admin_ativar_pagamento', { p_pagamento: id, p_business: business || null })
    if (error) setErro(error.message)
    carregar()
  }

  const pagos = (lista || []).filter(p => p.status === 'aprovado')
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0)
  const noMes = pagos.filter(p => new Date(p.aprovado_em) >= mes).reduce((s, p) => s + Number(p.valor), 0)
  const ativos = pagos.filter(p => p.vigente_ate && new Date(p.vigente_ate) > new Date()).length

  return (
    <AdminLayout>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[var(--raio)] bg-[var(--musgo)] p-4 text-white"><p className="text-[14px] text-white/75">Recebido no mês</p><p className="num text-[24px] font-extrabold">{reais(noMes)}</p></div>
        <div className="rounded-[var(--raio)] bg-[var(--papel)] p-4"><p className="text-[14px] text-[var(--leve)]">Planos ativos</p><p className="num text-[24px] font-extrabold">{ativos}</p></div>
      </div>
      {erro && <p className="mt-3 text-[14px] font-semibold text-[var(--sos)]">{erro}</p>}
      <h2 className="mt-6 text-[20px] font-extrabold">Pedidos e pagamentos</h2>
      {!lista ? <div className="esqueleto mt-3 h-32 rounded-[var(--raio)]" /> : !lista.length ? (
        <p className="mt-3 rounded-[var(--raio)] bg-[var(--papel)] p-4 text-[15px] text-[var(--leve)]">Nenhum pedido ainda. Eles chegam pela página Anuncie.</p>
      ) : (
        <ul className="mt-3 space-y-2">{lista.map(p => <Pedido key={p.id} p={p} lugares={lugares} onAtivar={ativar} />)}</ul>
      )}
    </AdminLayout>
  )
}
