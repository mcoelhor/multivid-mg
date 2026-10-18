import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Loader2, ArrowRight } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { DIAS, DIAS_NOME } from '../lib/horario'
import { registrar } from '../lib/track'
import { evento } from '../lib/marketing'

const FUNCAO = 'https://cpoxykaksqlrqnstjonv.supabase.co/functions/v1/cadastrar-negocio'
const campo = 'mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]'

/** Cadastro grátis feito pelo próprio comerciante. Entra fora do ar até o guia aprovar. */
export function Autocadastro() {
  const [f, setF] = useState({ name: '', category: 'alimentacao', subcategory: 'restaurantes', address: '', whatsapp: '', phone: '', description: '', contato: '', email: '', site_url: '', hours: {} })
  const [estado, setEstado] = useState('')
  const [msg, setMsg] = useState('')
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))
  const setH = d => e => setF(v => ({ ...v, hours: { ...v.hours, [d]: e.target.value } }))
  const cat = CATEGORIES.find(c => c.id === f.category)

  async function enviar(e) {
    e.preventDefault(); setMsg(''); setEstado('enviando')
    try {
      const r = await fetch(FUNCAO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.erro || 'Não foi possível cadastrar.')
      registrar('lead', { term: 'autocadastro' }); evento('lead', { content_name: 'autocadastro' })
      setEstado('ok')
    } catch (err) { setEstado('erro'); setMsg(err.message) }
  }

  if (estado === 'ok') {
    return (
      <div className="rounded-[var(--raio)] bg-[var(--araucaria)] p-6 text-white">
        <p className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.02em]"><Check size={24} className="text-[var(--broto)]" />Cadastro recebido</p>
        <p className="mt-2 text-[16px] leading-relaxed text-white/85">Conferimos os dados e colocamos sua página no ar, normalmente em até 2 dias úteis. Você recebe um WhatsApp quando estiver publicada, com o link para assumir a página e editar quando quiser.</p>
        <Link to="/anuncie#planos" className="botao botao-broto mt-5 w-full">Ver os planos de destaque <ArrowRight size={18} /></Link>
      </div>
    )
  }
  return (
    <form onSubmit={enviar} className="rounded-[var(--raio)] bg-[var(--papel)] p-5" noValidate>
      <div className="space-y-4">
        <div><label className="block text-[15px] font-bold" htmlFor="an">Nome do negócio</label><input id="an" required value={f.name} onChange={set('name')} maxLength={100} className={campo} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-[15px] font-bold" htmlFor="ac">Categoria</label>
            <select id="ac" value={f.category} onChange={e => { const c = CATEGORIES.find(x => x.id === e.target.value); setF(v => ({ ...v, category: e.target.value, subcategory: c?.subcategories[0]?.id || '' })) }} className={campo}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div><label className="block text-[15px] font-bold" htmlFor="as">Tipo</label>
            <select id="as" value={f.subcategory} onChange={set('subcategory')} className={campo}>{(cat?.subcategories || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
        </div>
        <div><label className="block text-[15px] font-bold" htmlFor="ae">Endereço</label><input id="ae" value={f.address} onChange={set('address')} maxLength={200} placeholder="Rua, número" className={campo} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-[15px] font-bold" htmlFor="aw">WhatsApp</label><input id="aw" inputMode="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="(35) 9 9999-9999" className={campo} /></div>
          <div><label className="block text-[15px] font-bold" htmlFor="ap">Telefone</label><input id="ap" inputMode="tel" value={f.phone} onChange={set('phone')} placeholder="(35) 3438-0000" className={campo} /></div>
        </div>
        <div><label className="block text-[15px] font-bold" htmlFor="ad">O que vocês oferecem <span className="font-medium text-[var(--leve)]">(2 frases)</span></label><textarea id="ad" rows={3} maxLength={600} value={f.description} onChange={set('description')} className={campo} /></div>
        <div>
          <p className="text-[15px] font-bold">Horário <span className="font-medium text-[var(--leve)]">(ex.: 08:00-18:00, fechado, 24h)</span></p>
          <div className="mt-1.5 grid grid-cols-1 gap-1.5">
            {DIAS.map(d => <label key={d} className="flex items-center gap-2"><span className="w-16 text-[14px] font-semibold">{DIAS_NOME[d].slice(0, 3)}</span><input value={f.hours[d] || ''} onChange={setH(d)} placeholder="08:00-18:00" className="min-w-0 flex-1 rounded-2xl bg-[var(--nevoa)] px-4 py-2.5 text-[15px]" /></label>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block text-[15px] font-bold" htmlFor="ar">Seu nome</label><input id="ar" required value={f.contato} onChange={set('contato')} autoComplete="name" className={campo} /></div>
          <div><label className="block text-[15px] font-bold" htmlFor="am">Seu e-mail</label><input id="am" type="email" value={f.email} onChange={set('email')} autoComplete="email" className={campo} /></div>
        </div>
        <input tabIndex={-1} aria-hidden="true" value={f.site_url} onChange={set('site_url')} className="absolute -left-[9999px] h-0 w-0" />
      </div>
      {msg && <p className="mt-4 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
      <button disabled={estado === 'enviando'} className="botao botao-pri mt-5 h-14 w-full text-[17px]">{estado === 'enviando' ? <Loader2 size={18} className="animate-spin" /> : 'Enviar cadastro grátis'}</button>
      <p className="mt-3 text-[14px] leading-snug text-[var(--leve)]">Já está no guia? Use <Link to="/anuncie#meu-negocio" className="font-bold text-[var(--musgo)] underline underline-offset-4">Este negócio é meu</Link>. Ao enviar, você autoriza o contato pelos dados informados.</p>
    </form>
  )
}
