import { useEffect, useState } from 'react'
import { MessageCircle, Mail } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'
import { INTERESSES } from '../components/LeadForm'

const STATUS = { novo: 'Novo', contatado: 'Contatado', proposta: 'Proposta enviada', fechado: 'Fechado (ganho)', perdido: 'Perdido', spam: 'Spam' }
const EMPRESAS = { portal: 'Portal', toca: 'Toca Engenharia', construtora: 'Construtora Monte Verde' }
const COR = { novo: '#b3261e', contatado: '#c9a54a', proposta: '#c9a54a', fechado: '#2e7d32', perdido: '#8a918b', spam: '#8a918b' }

function Lead({ l, salvar }) {
  const [st, setSt] = useState(l.status)
  const [notas, setNotas] = useState(l.notes)
  const [aberto, setAberto] = useState(l.status === 'novo')
  let wa = l.phone.replace(/\D/g, ''); if (wa.length === 11) wa = '55' + wa
  const saud = `Olá, ${l.name.split(' ')[0]}! Aqui é da ${EMPRESAS[l.company]}. Recebemos seu contato pelo Portal Monte Verde.`
  return (
    <li className="overflow-hidden rounded-2xl bg-white" style={{ boxShadow: `inset 4px 0 0 ${COR[l.status]}` }}>
      <button onClick={() => setAberto(v => !v)} className="flex w-full items-center gap-2 p-4 text-left" aria-expanded={aberto}>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{l.name}</span>
          <span className="block text-xs text-[#626a63]">{EMPRESAS[l.company]} · {INTERESSES[l.interest] || l.interest}</span>
        </span>
        <span className="text-right text-[11px] text-[#8a918b]">{STATUS[l.status]}<br />{new Date(l.created_at).toLocaleDateString('pt-BR')}</span>
      </button>
      <div className={`abre ${aberto ? 'aberto' : ''}`}><div>
        <div className="space-y-3 px-4 pb-4">
          {l.message && <p className="rounded-xl bg-[var(--creme)] p-3 text-sm">{l.message}</p>}
          <div className="flex gap-2">
            {wa.length === 13 && <a href={`https://wa.me/${wa}?text=${encodeURIComponent(saud)}`} target="_blank" rel="noopener noreferrer" className="botao botao-wa flex-1"><MessageCircle size={16} />{l.phone}</a>}
            {l.email && <a href={`mailto:${l.email}`} className="botao botao-sec w-11 px-0" aria-label="E-mail"><Mail size={16} /></a>}
          </div>
          <select value={st} onChange={e => setSt(e.target.value)} className="w-full rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm">
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} placeholder="Anotações (valor da proposta, próximo passo…)" className="w-full rounded-xl bg-[var(--creme)] p-3 text-sm" />
          <button onClick={() => salvar(l.id, st, notas)} className="botao botao-pri w-full">Salvar</button>
          <p className="text-[11px] text-[#8a918b]">Enviado da página {l.page || '/'}</p>
        </div>
      </div></div>
    </li>
  )
}

export function AdminLeads() {
  const [leads, setLeads] = useState(null)
  const [filtro, setFiltro] = useState('abertos')
  const carregar = () => supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(300).then(({ data }) => setLeads(data || []))
  useEffect(() => { carregar() }, [])

  async function salvar(id, status, notes) {
    await supabase.from('leads').update({ status, notes }).eq('id', id)
    carregar()
  }

  const lista = (leads || []).filter(l =>
    filtro === 'abertos' ? ['novo', 'contatado', 'proposta'].includes(l.status) :
    filtro === 'todos' ? l.status !== 'spam' : l.company === filtro)

  return (
    <AdminLayout>
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
        {[['abertos', 'Em aberto'], ['toca', 'Toca'], ['construtora', 'Construtora'], ['portal', 'Portal'], ['todos', 'Todos']].map(([k, r]) => (
          <button key={k} onClick={() => setFiltro(k)} className={`chip ${filtro === k ? 'ativo' : ''}`}>{r}</button>
        ))}
      </div>
      {leads === null ? <div className="esqueleto h-40 rounded-2xl" /> : lista.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-[#626a63]">Nenhum lead aqui. Os formulários estão nas páginas de Construção, Imóveis, Cadastrar negócio e Corrigir informação.</p>
      ) : (
        <ul className="space-y-2">{lista.map(l => <Lead key={l.id} l={l} salvar={salvar} />)}</ul>
      )}
    </AdminLayout>
  )
}
