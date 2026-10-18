import { useState } from 'react'
import { ArrowRight, Loader2, MessageCircle } from 'lucide-react'
import { EscolheNegocio } from '../pages/Anuncie'
import { registrar } from '../lib/track'
import { chamarComLogin } from '../lib/funcoes'

const campo = 'mt-1.5 w-full rounded-2xl bg-[var(--nevoa)] px-4 py-3.5 text-[16px]'

/** Mostra o código e o atalho para mandar pelo WhatsApp do negócio. */
export function CodigoConfirmacao({ codigo, negocio, whatsappGuia, escuro = true }) {
  const texto = `Código ${codigo}: sou responsável por ${negocio} no Monte Verde MG.`
  return (
    <div className={`rounded-[var(--raio)] p-5 ${escuro ? 'bg-[var(--araucaria)] text-white' : 'bg-[var(--papel)]'}`}>
      <p className={`text-[15px] ${escuro ? 'text-white/80' : 'text-[var(--leve)]'}`}>{negocio} · código de confirmação</p>
      <p className={`num mt-1 text-[40px] font-extrabold tracking-[0.08em] ${escuro ? 'text-[var(--broto)]' : 'text-[var(--musgo)]'}`}>{codigo}</p>
      {whatsappGuia ? (
        <>
          <p className={`mt-2 text-[15px] leading-relaxed ${escuro ? 'text-white/85' : 'text-[var(--leve)]'}`}>Mande este código <b>pelo WhatsApp do seu negócio</b> (o número que está no guia). Assim confirmamos que é você.</p>
          <a href={`https://wa.me/${whatsappGuia}?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className={`botao mt-4 w-full ${escuro ? 'botao-broto' : 'botao-wa'}`}><MessageCircle size={18} />Enviar código pelo WhatsApp</a>
        </>
      ) : (
        <p className={`mt-2 text-[15px] leading-relaxed ${escuro ? 'text-white/85' : 'text-[var(--leve)]'}`}>Vamos chamar no WhatsApp cadastrado do negócio e pedir este código.</p>
      )}
      <p className={`mt-3 text-[14px] leading-relaxed ${escuro ? 'text-white/65' : 'text-[var(--leve)]'}`}>Confirmado o código, o negócio aparece aqui na sua conta e você já pode editar e pôr fotos.</p>
    </div>
  )
}

/** "Já está no guia": o dono logado pede para assumir a página. O e-mail vem da conta. */
export function Reivindicar({ onPedido }) {
  const [neg, setNeg] = useState({ id: null, name: '' })
  const [f, setF] = useState({ nome_contato: '', whatsapp: '', cnpj: '', site_url: '' })
  const [estado, setEstado] = useState('')
  const [msg, setMsg] = useState('')
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    if (!neg.id) { setMsg('Escolha seu negócio na lista. Se ele não aparece, use “Ainda não está no guia”.'); return }
    setEstado('enviando'); setMsg('')
    try {
      const d = await chamarComLogin('reivindicar', { ...f, business_id: neg.id })
      registrar('lead', { term: 'reivindicacao', businessId: neg.id })
      setEstado(''); onPedido?.(d)
    } catch (err) { setEstado('erro'); setMsg(err.message) }
  }

  return (
    <form onSubmit={enviar} className="rounded-[var(--raio)] bg-[var(--papel)] p-5">
      <div className="space-y-4">
        <EscolheNegocio valor={neg} onChange={setNeg} />
        <div><label className="block text-[15px] font-bold" htmlFor="rn">Seu nome</label><input id="rn" required value={f.nome_contato} onChange={set('nome_contato')} autoComplete="name" className={campo} /></div>
        <div><label className="block text-[15px] font-bold" htmlFor="rw">Seu WhatsApp com DDD</label><input id="rw" required inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={set('whatsapp')} placeholder="(35) 9 9999-9999" className={campo} /></div>
        <div><label className="block text-[15px] font-bold" htmlFor="rc">CNPJ <span className="font-medium text-[var(--leve)]">(opcional, acelera a verificação)</span></label><input id="rc" inputMode="numeric" value={f.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" className={campo} /></div>
        <input tabIndex={-1} aria-hidden="true" value={f.site_url} onChange={set('site_url')} className="absolute -left-[9999px] h-0 w-0" />
      </div>
      {msg && <p className="mt-4 text-[15px] font-semibold text-[var(--sos)]" role="alert">{msg}</p>}
      <button disabled={estado === 'enviando'} className="botao botao-pri mt-5 h-14 w-full text-[17px]">
        {estado === 'enviando' ? <Loader2 size={18} className="animate-spin" /> : <>Pedir acesso <ArrowRight size={18} /></>}
      </button>
    </form>
  )
}
