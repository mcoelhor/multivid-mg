const ESTILO = {
  aberto: 'bg-[#dcefdc] text-[#1d5f31]',
  plantao: 'bg-[#f3e8cc] text-[#6e5208]',
  hoje: 'bg-[#f3e8cc] text-[#6e5208]',
  fechado: 'bg-[#f2e1dd] text-[#8a3b2e]',
  desconhecido: 'bg-[var(--nevoa-2)] text-[var(--leve)]',
}

/** Selo de horário. `longo` mostra "Aberto · fecha às 21h"; curto mostra "Aberto". */
export function StatusPill({ st, longo = false, className = '' }) {
  if (!st) return null
  if (st.estado === 'desconhecido' && !longo) return null
  const tipo = st.estado === 'fechado' && st.abreHoje ? 'hoje' : st.estado
  const texto = longo ? st.rotulo : st.curto
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-bold leading-none whitespace-nowrap ${ESTILO[tipo]} ${className}`}>
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

export function VerificadoBadge({ className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full bg-[#dcefdc] px-2.5 py-1 text-[13px] font-bold leading-none text-[#1d5f31] ${className}`} title="Informações confirmadas pelo responsável">Verificado</span>
}

export function ParceiroBadge({ className = '', plano = 'premium' }) {
  if (plano === 'destaque') return <span className={`inline-flex items-center rounded-full bg-[var(--broto)] px-2.5 py-1 text-[13px] font-bold leading-none text-[var(--araucaria)] ${className}`}>Destaque</span>
  return <span className={`inline-flex items-center rounded-full bg-[var(--araucaria)] px-2.5 py-1 text-[13px] font-bold leading-none text-[var(--broto)] ${className}`}>Parceiro</span>
}
