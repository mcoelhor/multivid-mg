import { useState } from 'react'
import { Check, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { registrar } from '../lib/track'

export const INTERESSES = {
  construcao: 'Construir ou reformar',
  projeto: 'Projeto de engenharia',
  chale: 'Construir chalé ou casa',
  imoveis: 'Comprar terreno ou imóvel',
  anunciar: 'Anunciar meu negócio no portal',
  correcao: 'Corrigir uma informação do portal',
  outro: 'Outro assunto',
}

/** Formulário de contato. Grava no banco; o painel avisa quando chega. */
export function LeadForm({ empresa = 'portal', interesse = '', titulo, botao = 'Enviar', compacto = false }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', interest: interesse || 'outro', message: '', lgpd: false, site: '' })
  const [estado, setEstado] = useState('livre') // livre | enviando | ok | erro
  const [aviso, setAviso] = useState('')
  const [t0] = useState(() => Date.now())
  const set = k => e => setF(v => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    if (f.site || Date.now() - t0 < 2500) { setEstado('ok'); return } // robô
    const tel = f.phone.replace(/\D/g, '')
    if (f.name.trim().length < 2) return setAviso('Escreva seu nome.')
    if (tel.length < 10) return setAviso('Confira o WhatsApp com DDD, por exemplo (35) 99999-9999.')
    if (!f.lgpd) return setAviso('Marque a autorização de contato para enviar.')
    setAviso(''); setEstado('enviando')
    const { error } = await supabase.from('leads').insert({
      name: f.name.trim().slice(0, 120), phone: f.phone.trim().slice(0, 40), email: f.email.trim().slice(0, 120),
      company: empresa, interest: f.interest, message: f.message.trim().slice(0, 2000), page: location.pathname,
    })
    if (error) { setEstado('erro'); setAviso('Não foi possível enviar agora. Confira a conexão e tente de novo.'); return }
    registrar('lead', { term: empresa })
    setEstado('ok')
  }

  if (estado === 'ok') {
    return (
      <div className={`entra flex items-start gap-3 rounded-2xl bg-[#e3f1e4] p-4 text-[#1f6b2a] ${compacto ? '' : 'mt-2'}`}>
        <Check size={20} className="mt-0.5 shrink-0" />
        <p className="text-sm font-medium">Recebido. Vamos responder pelo WhatsApp que você informou.</p>
      </div>
    )
  }

  const campo = 'w-full rounded-xl bg-[#f4f1eb] px-3.5 py-3 text-[15px] text-[#17241c] placeholder:text-[#8a918b] focus:bg-white focus:shadow-[inset_0_0_0_1.5px_var(--verde)] transition'
  return (
    <form onSubmit={enviar} className={compacto ? 'space-y-2.5' : 'space-y-3 rounded-2xl bg-white p-4'} noValidate>
      {titulo && <h3 className="text-lg font-bold text-[#17241c]">{titulo}</h3>}
      <input aria-hidden="true" tabIndex={-1} autoComplete="off" value={f.site} onChange={set('site')} className="absolute -left-[9999px] h-px w-px" />
      <input className={campo} placeholder="Seu nome" autoComplete="name" value={f.name} onChange={set('name')} maxLength={120} />
      <input className={campo} placeholder="WhatsApp com DDD" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} maxLength={40} />
      {!compacto && <input className={campo} placeholder="E-mail (opcional)" type="email" autoComplete="email" value={f.email} onChange={set('email')} maxLength={120} />}
      {!interesse && (
        <select className={campo} value={f.interest} onChange={set('interest')}>
          {Object.entries(INTERESSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      )}
      <textarea className={campo} rows={3} placeholder="Conte rapidamente o que você precisa" value={f.message} onChange={set('message')} maxLength={2000} />
      <label className="flex items-start gap-2.5 text-[13px] text-[#626a63]">
        <input type="checkbox" checked={f.lgpd} onChange={set('lgpd')} className="mt-0.5 h-4 w-4 accent-[var(--verde)]" />
        Autorizo o contato pelos dados acima para responder a este pedido.
      </label>
      {aviso && <p className="text-[13px] font-medium text-[#8a3b2e]" role="alert">{aviso}</p>}
      <button type="submit" disabled={estado === 'enviando'} className="botao botao-pri w-full disabled:opacity-60">
        <Send size={16} />{estado === 'enviando' ? 'Enviando…' : botao}
      </button>
    </form>
  )
}
