import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'

const VAZIO = { title: '', description: '', category: 'cultura', date_start: '', date_end: '', time_start: '', location: '', image_url: '', link: '', active: true }

export function AdminEvents() {
  const [lista, setLista] = useState(null)
  const [novo, setNovo] = useState(null)
  const [erro, setErro] = useState('')
  const carregar = () => supabase.from('events').select('*').order('date_start', { ascending: false }).then(({ data }) => setLista(data || []))
  useEffect(() => { carregar() }, [])
  const set = k => e => setNovo(v => ({ ...v, [k]: e.target.value }))

  async function salvar() {
    if (!novo.title || !novo.date_start) return setErro('Informe título e data.')
    const { error } = await supabase.from('events').insert({ ...novo, date_end: novo.date_end || null })
    if (error) return setErro(error.message)
    setNovo(null); setErro(''); carregar()
  }
  async function alternar(ev) { await supabase.from('events').update({ active: !ev.active }).eq('id', ev.id); carregar() }

  const campo = 'w-full rounded-xl bg-[var(--creme)] px-3 py-2.5 text-sm'
  return (
    <AdminLayout>
      {!novo ? (
        <button onClick={() => setNovo({ ...VAZIO })} className="botao botao-pri w-full"><Plus size={16} />Novo evento</button>
      ) : (
        <div className="entra space-y-2.5 rounded-2xl bg-white p-4">
          <input className={campo} placeholder="Título" value={novo.title} onChange={set('title')} />
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-[#626a63]">Início<input type="date" className={campo} value={novo.date_start} onChange={set('date_start')} /></label>
            <label className="text-xs text-[#626a63]">Fim<input type="date" className={campo} value={novo.date_end} onChange={set('date_end')} /></label>
          </div>
          <input className={campo} placeholder="Horário (ex.: 19h)" value={novo.time_start} onChange={set('time_start')} />
          <input className={campo} placeholder="Local" value={novo.location} onChange={set('location')} />
          <select className={campo} value={novo.category} onChange={set('category')}>
            {['musica', 'gastronomia', 'festival', 'turismo', 'feiras', 'cultura'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea className={campo} rows={2} placeholder="Descrição" value={novo.description} onChange={set('description')} />
          <input className={campo} placeholder="Link da imagem (opcional)" value={novo.image_url} onChange={set('image_url')} />
          <input className={campo} placeholder="Link de ingressos ou site (opcional)" value={novo.link} onChange={set('link')} />
          {erro && <p className="text-sm text-[#8a3b2e]">{erro}</p>}
          <div className="flex gap-2"><button onClick={() => setNovo(null)} className="botao botao-sec flex-1">Cancelar</button><button onClick={salvar} className="botao botao-pri flex-1">Salvar</button></div>
        </div>
      )}
      <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-2xl bg-white">
        {lista === null ? <li className="esqueleto h-20" /> : lista.length === 0 ? <li className="p-4 text-sm text-[#626a63]">Nenhum evento cadastrado.</li> : lista.map(ev => (
          <li key={ev.id} className="flex items-center gap-3 p-3.5">
            <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{ev.title}</span><span className="text-[11px] text-[#626a63]">{new Date(ev.date_start + 'T12:00').toLocaleDateString('pt-BR')} · {ev.location}</span></span>
            <button onClick={() => alternar(ev)} className="chip">{ev.active ? 'Visível' : 'Oculto'}</button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  )
}
