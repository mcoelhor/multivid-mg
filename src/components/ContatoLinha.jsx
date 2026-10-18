import { Link } from 'react-router-dom'
import { Phone, MessageCircle, Navigation } from 'lucide-react'
import { StatusPill } from './UI/Badge'
import { registrar, linkTel, linkWhatsApp, linkRota } from '../lib/track'

/** Linha de contato rápido (emergência e busca): nome, status, endereço e botões grandes. */
export function ContatoLinha({ b, index = 0 }) {
  const borda = { aberto: '#2e7d32', plantao: 'var(--ouro)', fechado: '#d8d3c7', desconhecido: '#d8d3c7' }[b.st?.estado] || '#d8d3c7'
  const local = [b.address, b.city && b.city !== 'Monte Verde' ? b.city : ''].filter(Boolean).join(' · ')
  return (
    <li className="entra rounded-2xl bg-white p-4" style={{ '--i': Math.min(index, 10), boxShadow: `inset 4px 0 0 ${borda}` }}>
      <Link to={`/estabelecimento/${b.slug}`} className="block pressiona">
        <span className="block text-[16px] font-bold leading-snug text-[#17241c]">{b.name}</span>
        <StatusPill st={b.st} longo className="mt-1.5" />
        {local && <span className="mt-1.5 block text-[13px] text-[#626a63]">{local}</span>}
      </Link>
      <div className="mt-3 flex gap-2">
        {b.phone ? (
          <a href={linkTel(b.phone)} onClick={() => registrar('tel', { businessId: b.id })} className="botao botao-pri flex-1"><Phone size={16} />Ligar</a>
        ) : null}
        {b.whatsapp ? (
          <a href={linkWhatsApp(b.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => registrar('whatsapp', { businessId: b.id })} className="botao botao-wa flex-1"><MessageCircle size={16} />WhatsApp</a>
        ) : null}
        {(b.address || b.latitude) ? (
          <a href={linkRota(b)} target="_blank" rel="noopener noreferrer" onClick={() => registrar('rota', { businessId: b.id })} className="botao botao-sec flex-1"><Navigation size={16} />Rota</a>
        ) : null}
      </div>
    </li>
  )
}
