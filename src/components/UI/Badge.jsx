const ESTILO = {
  aberto: 'bg-[#E3F1E4] text-[#1F6B2A]',
  plantao: 'bg-[#F6EDD3] text-[#7A5A08]',
  hoje: 'bg-[#F6EDD3] text-[#7A5A08]',
  fechado: 'bg-[#F4E4E0] text-[#8A3B2E]',
  desconhecido: 'bg-[#ECEAE3] text-[#626A63]',
}

/** Selo de horário. `longo` mostra "Aberto · fecha às 21h"; curto mostra "Aberto". */
export function StatusPill({ st, longo = false, className = '' }) {
  if (!st) return null
  if (st.estado === 'desconhecido' && !longo) return null
  const tipo = st.estado === 'fechado' && st.abreHoje ? 'hoje' : st.estado
  const texto = longo ? st.rotulo : st.curto
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${ESTILO[tipo]} ${className}`}>
      {st.estado !== 'desconhecido' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {texto}
    </span>
  )
}

/** Compatibilidade com telas antigas. */
export function OpenBadge({ isOpen }) {
  if (isOpen === null || isOpen === undefined) return null
  return <StatusPill st={{ estado: isOpen ? 'aberto' : 'fechado', curto: isOpen ? 'Aberto' : 'Fechado', rotulo: '' }} />
}

export function ParceiroBadge({ className = '' }) {
  return <span className={`inline-flex items-center rounded-md bg-[#C9A54A] px-2 py-0.5 text-[11px] font-bold text-[#2A2006] ${className}`}>Parceiro</span>
}
