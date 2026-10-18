import { useEffect, useState } from 'react'
import { MessageCircle, Check, X, BadgeCheck, RefreshCcw } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'

const FUNCAO = 'https://cpoxykaksqlrqnstjonv.supabase.co/functions/v1/aprovar-reivindicacao'
const data = d => (d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '')

async function chamar(corpo) {
  const { data: s } = await supabase.auth.getSession()
  const r = await fetch(FUNCAO, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.session?.access_token}` }, body: JSON.stringify(corpo) })
  const d = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(d.erro || 'falha')
  return d
}

function Pedido({ p, onMudou }) {
  const [acesso, setAcesso] = useState(null)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  let wa = (p.whatsapp || '').replace(/\D/g, ''); if (wa.length === 10 || wa.length === 11) wa = '55' + wa
  const nome = p.businesses?.name || '?'
  const msgPedido = `Olá, ${p.nome_contato.split(' ')[0]}! Aqui é do Monte Verde MG. Recebemos seu pedido de acesso a ${nome}. Para confirmar, responda com o código que apareceu na tela, pelo WhatsApp do negócio.`
  const msgAcesso = acesso ? `Pronto, ${p.nome_contato.split(' ')[0]}! Seu acesso a ${nome} no Monte Verde MG:\nAcesse monteverdemg.com.br/meu-negocio\nE-mail: ${acesso.email}\nSenha: ${acesso.senha}\nTroque a senha na primeira entrada. Lá você edita horário, fotos e contatos.` : ''

  async function decidir(acao) {
    setEnviando(true); setErro('')
    try {
      const d = await chamar({ acao, id: p.id })
      if (acao === 'aprovar') setAcesso({ email: d.email, senha: d.senha })
      onMudou()
    } catch (e) { setErro(e.message) }
    setEnviando(false)
  }

  return (
    <li className="rounded-2xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[16px] font-bold leading-tight">{nome}</p>
          <p className="text-[13px] text-[#626a63]">{p.nome_contato} · {p.whatsapp} · {p.email}</p>
          <p className="text-[12px] text-[#8a918b]">{data(p.criado_em)} · código <b className="num">{p.codigo}</b></p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${p.status === 'verificada' ? 'bg-[#dcefdc] text-[#1d5f31]' : p.status === 'recusada' ? 'bg-[#f2e1dd] text-[#8a3b2e]' : 'bg-[#f3e8cc] text-[#6e5208]'}`}>{p.status}</span>
      </div>
      {p.cnpj && (
        <p className={`mt-2 rounded-xl px-3 py-2 text-[13px] ${p.cnpj_confere ? 'bg-[#dcefdc] text-[#1d5f31]' : p.cnpj_confere === false ? 'bg-[#f2e1dd] text-[#8a3b2e]' : 'bg-[var(--creme)]'}`}>
          CNPJ {p.cnpj}: {p.cnpj_nome || 'sem retorno da Receita'}{p.cnpj_situacao ? ` · ${p.cnpj_situacao}` : ''}{p.cnpj_municipio ? ` · ${p.cnpj_municipio}` : ''}{p.cnpj_confere === true ? ' · nome confere' : p.cnpj_confere === false ? ' · nome NÃO confere' : ''}
        </p>
      )}
      {p.status === 'pendente' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {wa.length >= 12 && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(msgPedido)}`} target="_blank" rel="noopener noreferrer" className="botao botao-wa h-10 min-h-0 flex-1 text-[14px]"><MessageCircle size={15} />Pedir o código</a>}
          <button disabled={enviando} onClick={() => decidir('aprovar')} className="botao botao-pri h-10 min-h-0 flex-1 text-[14px]"><Check size={15} />Código confere: aprovar</button>
          <button disabled={enviando} onClick={() => decidir('recusar')} className="botao botao-sec h-10 min-h-0 px-3 text-[14px]"><X size={15} />Recusar</button>
        </div>
      )}
      {acesso && (
        <div className="mt-3 rounded-xl bg-[var(--creme)] p-3">
          <p className="text-[13px] font-bold">Acesso criado. Mande pelo WhatsApp (a senha só aparece agora):</p>
          <textarea readOnly rows={5} value={msgAcesso} className="mt-1 w-full rounded-xl bg-white p-2 text-[12px]" onFocus={e => e.target.select()} />
          {wa.length >= 12 && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(msgAcesso)}`} target="_blank" rel="noopener noreferrer" className="botao botao-wa mt-2 h-10 min-h-0 w-full text-[14px]"><MessageCircle size={15} />Enviar acesso</a>}
        </div>
      )}
      {p.status === 'verificada' && !acesso && (
        <button disabled={enviando} onClick={async () => { setEnviando(true); try { const d = await chamar({ acao: 'reenviar', email: p.email, business_id: p.business_id }); setAcesso({ email: p.email, senha: d.senha }) } catch (e) { setErro(e.message) } setEnviando(false) }} className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[var(--verde)]"><RefreshCcw size={13} />Gerar senha nova</button>
      )}
      {erro && <p className="mt-2 text-[13px] font-semibold text-[var(--sos)]">{erro}</p>}
    </li>
  )
}

export function AdminReivindicacoes() {
  const [lista, setLista] = useState(null)
  const [cfg, setCfg] = useState('')
  const [salvo, setSalvo] = useState('')
  const carregar = () => supabase.from('reivindicacoes').select('*, businesses(name)').order('criado_em', { ascending: false }).limit(100).then(({ data }) => setLista(data || []))
  useEffect(() => {
    carregar()
    supabase.from('config').select('valor').eq('chave', 'whatsapp_guia').maybeSingle().then(({ data }) => setCfg(data?.valor || ''))
  }, [])
  async function salvarCfg() {
    const { error } = await supabase.from('config').upsert({ chave: 'whatsapp_guia', valor: cfg.replace(/\D/g, ''), atualizado_em: new Date().toISOString() })
    setSalvo(error ? 'Erro ao salvar' : 'Salvo'); setTimeout(() => setSalvo(''), 2000)
  }
  const pendentes = (lista || []).filter(p => p.status === 'pendente')

  return (
    <AdminLayout>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="flex items-center gap-2 font-bold"><BadgeCheck size={18} className="text-[var(--verde)]" />Como funciona a verificação</h2>
        <p className="mt-1 text-[13px] text-[#626a63]">O dono vê um código na tela e manda pelo WhatsApp do negócio para o número abaixo. Se a mensagem veio do número que está no guia (ou do WhatsApp do pedido) e o código bate, aprove: o acesso é criado na hora e você envia por WhatsApp. O CNPJ, quando informado, é consultado na Receita e comparado com o nome.</p>
        <label className="mt-3 block text-[13px] font-bold">WhatsApp do guia (com DDD, só números)</label>
        <div className="mt-1 flex gap-2">
          <input value={cfg} onChange={e => setCfg(e.target.value)} inputMode="tel" placeholder="5535999999999" className="min-w-0 flex-1 rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm" />
          <button onClick={salvarCfg} className="botao botao-pri h-10 min-h-0 px-4 text-[14px]">{salvo || 'Salvar'}</button>
        </div>
        {!cfg && <p className="mt-2 text-[12px] text-[#8a3b2e]">Sem número, o dono só vê o código e você precisa chamá-lo pelo botão "Pedir o código".</p>}
      </section>

      <h2 className="mt-5 text-[18px] font-extrabold">Pedidos {pendentes.length ? <span className="num text-[var(--sos)]">· {pendentes.length} pendentes</span> : null}</h2>
      {lista === null ? <div className="esqueleto mt-3 h-24 rounded-2xl" /> : lista.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white p-4 text-sm text-[#626a63]">Nenhum pedido ainda. Eles chegam por "Este negócio é meu", na página Anuncie.</p>
      ) : (
        <ul className="mt-3 space-y-2">{lista.map(p => <Pedido key={p.id} p={p} onMudou={carregar} />)}</ul>
      )}
    </AdminLayout>
  )
}
