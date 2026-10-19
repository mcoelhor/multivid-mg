import { useState } from 'react'
import { MessageCircle, Globe } from 'lucide-react'
import { LeadForm } from './LeadForm'
import { registrar, linkWhatsApp } from '../lib/track'

// As duas empresas parceiras, cada uma com sua identidade.
// Sempre identificadas como "Parceiro do portal" (publicidade identificada).
export const PARCEIROS = {
  toca: {
    nome: 'Toca Engenharia',
    slogan: 'Da ideia à realidade, com engenharia de verdade.',
    servicos: 'Projetos, execução de obras, reformas e regularização.',
    wa: '5531995207200',
    site: 'https://tocaengenharia.com.br',
    cor: '#14532d',
    banner: '/parceiros/toca.webp',
    interesse: 'projeto',
  },
  construtora: {
    nome: 'Construtora Monte Verde',
    slogan: 'Mais que construções, realizamos estilos de vida.',
    servicos: 'Chalés, residências e empreendimentos na Serra da Mantiqueira.',
    wa: '', // (35) 9973-6593 está com 8 dígitos: confirmar o número antes de ativar o botão
    site: '',
    cor: '#6b4f3a',
    banner: '/parceiros/construtora.webp',
    interesse: 'chale',
  },
}

const TEXTOS = {
  construcao: ['Vai construir ou reformar em Monte Verde?', 'Engenharia com quem conhece o clima, o terreno e as regras da serra.'],
  imobiliarias: ['Comprou terreno ou pensa em construir?', 'Do projeto à chave na mão, com acompanhamento técnico.'],
  busca: ['Precisa de obra, projeto ou reforma?', 'Parceiros do portal especializados em construção na região.'],
  home: ['Construir em Monte Verde', 'Engenharia e construção de confiança na Serra da Mantiqueira.'],
}

function CartaoParceiro({ id, p }) {
  const [form, setForm] = useState(false)
  const [semBanner, setSemBanner] = useState(false)
  const msg = `Olá! Vi a ${p.nome} no Portal Monte Verde e gostaria de conversar sobre um projeto.`
  return (
    <article className="revela overflow-hidden rounded-[var(--raio)] bg-[var(--papel)]">
      {!semBanner && (
        <img src={p.banner} alt={`${p.nome}: ${p.slogan}`} className="w-full aspect-[16/7] object-cover" loading="lazy" onError={() => setSemBanner(true)} />
      )}
      <div className="p-5">
        <h3 className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: p.cor }}>{p.nome}</h3>
        <p className="mt-0.5 text-[16px] text-[var(--leve)]">{p.slogan}</p>
        <p className="mt-2 text-[16px] leading-snug">{p.servicos}</p>
        <div className="mt-4 flex gap-2">
          {p.wa && (
            <a href={linkWhatsApp(p.wa, msg)} target="_blank" rel="noopener noreferrer" onClick={() => registrar('parceiro', { term: `${id}:whatsapp` })} className="botao botao-wa flex-1">
              <MessageCircle size={16} />WhatsApp
            </a>
          )}
          <button onClick={() => setForm(v => !v)} aria-expanded={form} className={`botao flex-1 ${p.wa ? 'botao-sec' : 'botao-pri'}`}>Pedir orçamento</button>
          {p.site && (
            <a href={`${p.site}?utm_source=monteverdemg&utm_medium=app`} target="_blank" rel="noopener noreferrer" onClick={() => registrar('parceiro', { term: `${id}:site` })} className="botao botao-sec h-12 w-12 min-h-0 px-0" aria-label={`Site da ${p.nome}`}>
              <Globe size={17} />
            </a>
          )}
        </div>
        <div className={`abre ${form ? 'aberto' : ''}`}>
          <div><div className="pt-3"><LeadForm empresa={id} interesse={p.interesse} botao="Pedir orçamento" compacto /></div></div>
        </div>
      </div>
    </article>
  )
}

/** Bloco de parceiros. contexto: construcao | imobiliarias | busca | home */
export function Parceiros({ contexto = 'construcao' }) {
  const [titulo, sub] = TEXTOS[contexto] || TEXTOS.construcao
  const ordem = contexto === 'imobiliarias' ? ['construtora', 'toca'] : ['toca', 'construtora']
  return (
    <section className="px-5 py-6" aria-label="Parceiros do guia">
      <h2 className="titulo revela">{titulo}</h2>
      <p className="revela mt-2 text-[16px] leading-relaxed text-[var(--leve)]">{sub} <span className="font-bold text-[var(--araucaria)]">Parceiros do guia.</span></p>
      <div className="grade-cards mt-5 space-y-3">
        {ordem.map(k => <CartaoParceiro key={k} id={k} p={PARCEIROS[k]} />)}
      </div>
    </section>
  )
}
