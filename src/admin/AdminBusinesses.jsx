import { useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'
import { carregarLugares } from '../hooks/useBusinesses'
import { CATEGORIES } from '../data/categories'
import { DIAS, DIAS_NOME, statusHorario } from '../lib/horario'
import { norm } from '../lib/busca'

const GRUPOS = ['Emergência', 'Comer', 'Ficar', 'Fazer', 'Comprar', 'Serviços', 'Construção', 'Imóveis']
const VAZIO = { name: '', description: '', category: 'alimentacao', subcategory: 'restaurantes', urgency_group: 'Comer', address: '', city: 'Monte Verde', phone: '', phone2: '', whatsapp: '', instagram: '', website: '', hours: {}, open_24h: '', plan: 'free', featured: false, status: 'active', validation: 'pendente', internal_notes: '' }
const slugify = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

function Rot({ t, children, full }) {
  return <label className={`block ${full ? 'col-span-2' : ''}`}><span className="mb-1 block text-xs font-semibold text-[#626a63]">{t}</span>{children}</label>
}

function Editor({ inicial, onClose, onSalvo }) {
  const [b, setB] = useState({ ...VAZIO, ...inicial, hours: { ...(inicial.hours || {}) } })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const set = k => e => setB(v => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setH = d => e => setB(v => ({ ...v, hours: { ...v.hours, [d]: e.target.value } }))
  const cat = CATEGORIES.find(c => c.id === b.category)

  async function salvar() {
    if (!b.name.trim()) return setErro('Informe o nome.')
    setSalvando(true); setErro('')
    const hours = Object.fromEntries(Object.entries(b.hours).filter(([, v]) => String(v).trim()).map(([k, v]) => [k, String(v).trim().toLowerCase()]))
    const whatsapp = b.whatsapp.replace(/\D/g, '').replace(/^(\d{11})$/, '55$1')
    const dados = { ...b, hours: Object.keys(hours).length ? hours : null, whatsapp }
    delete dados.id; delete dados.business_images; delete dados.created_at; delete dados.updated_at
    const r = b.id
      ? await supabase.from('businesses').update(dados).eq('id', b.id)
      : await supabase.from('businesses').insert({ ...dados, slug: `${slugify(b.name)}-${Date.now().toString(36).slice(-4)}` })
    setSalvando(false)
    if (r.error) return setErro(r.error.message)
    carregarLugares(true); onSalvo()
  }

  const campo = 'w-full rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm'
  const st = statusHorario(b)

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 p-3" onClick={onClose}>
      <div className="entra mx-auto max-w-[460px] rounded-3xl bg-white p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{b.id ? 'Editar lugar' : 'Novo lugar'}</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--creme)]" aria-label="Fechar"><X size={16} /></button></div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Rot t="Nome" full><input className={campo} value={b.name} onChange={set('name')} /></Rot>
          <Rot t="Categoria"><select className={campo} value={b.category} onChange={e => { const c = CATEGORIES.find(x => x.id === e.target.value); setB(v => ({ ...v, category: e.target.value, subcategory: c?.subcategories[0]?.id || '' })) }}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}<option value="emergencia">Utilidade pública</option></select></Rot>
          <Rot t="Tipo"><select className={campo} value={b.subcategory} onChange={set('subcategory')}>
            {(cat?.subcategories || [{ id: 'utilidade-publica', name: 'Utilidade pública' }]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Rot>
          <Rot t="Grupo de urgência"><select className={campo} value={b.urgency_group} onChange={set('urgency_group')}>{GRUPOS.map(g => <option key={g}>{g}</option>)}</select></Rot>
          <Rot t="Cidade"><select className={campo} value={b.city} onChange={set('city')}><option>Monte Verde</option><option>Camanducaia</option></select></Rot>
          <Rot t="Endereço" full><input className={campo} value={b.address} onChange={set('address')} /></Rot>
          <Rot t="Telefone"><input className={campo} value={b.phone} onChange={set('phone')} placeholder="(35) 3438-0000" /></Rot>
          <Rot t="Telefone 2"><input className={campo} value={b.phone2} onChange={set('phone2')} /></Rot>
          <Rot t="WhatsApp (celular com DDD)" full><input className={campo} value={b.whatsapp} onChange={set('whatsapp')} placeholder="35999990000" /></Rot>
          <Rot t="Instagram"><input className={campo} value={b.instagram} onChange={set('instagram')} placeholder="@perfil" /></Rot>
          <Rot t="Site"><input className={campo} value={b.website} onChange={set('website')} placeholder="https://" /></Rot>
          <Rot t="Descrição" full><textarea className={campo} rows={2} value={b.description} onChange={set('description')} /></Rot>
        </div>

        <p className="mt-4 text-sm font-bold">Horário</p>
        <p className="text-xs text-[#626a63]">Ex.: 08:00-18:00 · dois turnos 12:00-15:00,19:00-23:00 · fechado · 24h. Vazio = não informado.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {DIAS.map(d => <Rot key={d} t={DIAS_NOME[d]}><input className={campo} value={b.hours[d] || ''} onChange={setH(d)} placeholder="08:00-18:00" /></Rot>)}
          <Rot t="Atende 24h"><select className={campo} value={b.open_24h} onChange={set('open_24h')}><option value="">Não</option><option value="sim">Sim, aberto 24h</option><option value="plantão">Plantão por telefone</option></select></Rot>
        </div>
        <p className="mt-2 text-xs text-[#626a63]">Agora apareceria como: <b>{st.rotulo}</b></p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Rot t="Plano"><select className={campo} value={b.plan} onChange={set('plan')}><option value="free">Gratuito</option><option value="destaque">Destaque</option><option value="premium">Parceiro</option></select></Rot>
          <Rot t="Situação"><select className={campo} value={b.status} onChange={set('status')}><option value="active">Visível</option><option value="hidden">Oculto</option></select></Rot>
          <Rot t="Validação"><select className={campo} value={b.validation} onChange={set('validation')}><option value="confirmado">Confirmado</option><option value="provavel">Provável</option><option value="verificar">Verificar</option><option value="pendente">Pendente</option></select></Rot>
          <Rot t="Notas internas" full><textarea className={campo} rows={2} value={b.internal_notes || ''} onChange={set('internal_notes')} /></Rot>
        </div>
        {erro && <p className="mt-3 text-sm font-medium text-[#8a3b2e]">{erro}</p>}
        <button onClick={salvar} disabled={salvando} className="botao botao-pri mt-4 w-full disabled:opacity-60">{salvando ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </div>
  )
}

export function AdminBusinesses() {
  const [lista, setLista] = useState(null)
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [editando, setEditando] = useState(null)
  const carregar = () => supabase.from('businesses').select('*').order('name').then(({ data }) => setLista(data || []))
  useEffect(() => { carregar() }, [])

  const filtrada = useMemo(() => (lista || []).filter(b => {
    if (q && !norm(b.name).includes(norm(q))) return false
    if (filtro === 'sem-horario') return !b.hours && !b.open_24h && ['Emergência', 'Comer', 'Comprar', 'Serviços', 'Fazer'].includes(b.urgency_group)
    if (filtro === 'verificar') return ['verificar', 'pendente'].includes(b.validation)
    if (filtro === 'ocultos') return b.status !== 'active'
    return true
  }), [lista, q, filtro])

  return (
    <AdminLayout>
      <div className="flex gap-2">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar pelo nome" className="min-w-0 flex-1 rounded-xl bg-white px-3.5 py-2.5 text-sm" />
        <button onClick={() => setEditando({})} className="botao botao-pri"><Plus size={16} />Novo</button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto py-3 scrollbar-hide">
        {[['todos', 'Todos'], ['sem-horario', 'Sem horário'], ['verificar', 'A verificar'], ['ocultos', 'Ocultos']].map(([k, r]) => (
          <button key={k} onClick={() => setFiltro(k)} className={`chip ${filtro === k ? 'ativo' : ''}`}>{r}</button>
        ))}
      </div>
      <p className="mb-2 text-xs text-[#626a63]">{filtrada.length} lugares{filtro === 'sem-horario' ? ' sem horário (comece pela Emergência e Comer)' : ''}</p>
      {lista === null ? <div className="esqueleto h-40 rounded-2xl" /> : (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl bg-white">
          {filtrada.map(b => (
            <li key={b.id}>
              <button onClick={() => setEditando(b)} className="flex w-full items-center gap-3 p-3.5 text-left">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{b.name}</span>
                  <span className="block truncate text-[11px] text-[#626a63]">{b.urgency_group} · {b.phone || 'sem telefone'} · {b.validation}</span>
                </span>
                {b.status !== 'active' && <span className="rounded-md bg-[var(--creme)] px-2 py-0.5 text-[11px]">oculto</span>}
                {b.plan !== 'free' && <span className="rounded-md bg-[#f2e7c6] px-2 py-0.5 text-[11px] text-[#6b5413]">{b.plan}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {editando && <Editor inicial={editando} onClose={() => setEditando(null)} onSalvo={() => { setEditando(null); carregar() }} />}
    </AdminLayout>
  )
}
