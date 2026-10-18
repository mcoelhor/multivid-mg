import { Clock, Phone } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Icon } from '../components/UI/Icon'
import { ContatoLinha } from '../components/ContatoLinha'
import { useBusinesses, ordenar } from '../hooks/useBusinesses'
import { agoraMV, DIAS_NOME, DIAS, hhmm } from '../lib/horario'
import { linkTel, registrar } from '../lib/track'

const SECOES = [
  ['Saúde', 'Stethoscope', ['pronto-socorro', 'hospitais', 'clinicas', 'dentistas', 'laboratorios']],
  ['Farmácias', 'Pill', ['farmacias']],
  ['Carro', 'Car', ['oficinas', 'borracharias', 'postos']],
  ['Táxi', 'CarTaxiFront', ['taxis']],
  ['Animais', 'PawPrint', ['veterinarios']],
]

export function Sos() {
  const { businesses, loading, error } = useBusinesses({ group: 'Emergência' })
  const numeros = businesses.filter(b => b.subcategory === 'utilidade-publica').sort((a, b) => Number(a.phone) - Number(b.phone))
  const a = agoraMV()

  return (
    <Layout title="Precisa de ajuda?" subtitle="Monte Verde e Camanducaia" tom="sos">
      <div className="bg-[var(--sos-fundo)] px-5 pb-4 pt-3">
        <p className="flex items-start gap-1.5 text-[14px] font-medium text-[#7a2f23]">
          <Clock size={14} className="mt-0.5 shrink-0" /><span>Agora: {DIAS_NOME[DIAS[a.dia]]}, <span className="num">{hhmm(a.min)}</span>. Quem está aberto aparece primeiro.</span>
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {numeros.map((b, i) => (
            <a key={b.id} href={linkTel(b.phone)} onClick={() => registrar('tel', { businessId: b.id })}
              className="cai pressiona flex flex-col items-center rounded-[var(--raio)] bg-white py-3" style={{ '--i': i }}>
              <span className="num text-[30px] font-extrabold leading-none text-[var(--sos)]">{b.phone}</span>
              <span className="mt-1 text-[13px] font-medium">{b.name.split(' —')[0].replace(' Militar', '')}</span>
            </a>
          ))}
        </div>
      </div>

      <nav className="sticky z-30 flex gap-2 overflow-x-auto bg-[var(--creme)]/95 px-5 py-2.5 backdrop-blur scrollbar-hide" style={{ top: 'calc(env(safe-area-inset-top) + 70px)' }} aria-label="Seções">
        {SECOES.map(([t, ic]) => (
          <a key={t} href={`#sos-${t}`} className="chip"><Icon name={ic} size={15} />{t}</a>
        ))}
      </nav>

      {loading && <div className="space-y-2 px-5 pt-2">{[0, 1, 2].map(i => <div key={i} className="esqueleto h-32 rounded-[var(--raio)]" />)}</div>}
      {error && <p className="mx-5 mt-3 rounded-[var(--raio)] bg-white p-4 text-sm text-[#8a3b2e]">Sem conexão agora. Em emergência médica ligue 192; polícia 190; bombeiros 193.</p>}

      {SECOES.map(([titulo, ic, subs]) => {
        const itens = ordenar(businesses.filter(b => subs.includes(b.subcategory)))
          .sort((x, y) => {
            const ex = x.st.estado === 'aberto' || x.st.estado === 'plantao' ? 0 : 1
            const ey = y.st.estado === 'aberto' || y.st.estado === 'plantao' ? 0 : 1
            return ex - ey || subs.indexOf(x.subcategory) - subs.indexOf(y.subcategory)
          })
        if (!itens.length) return null
        return (
          <section key={titulo} id={`sos-${titulo}`} className="px-5 pt-5" style={{ scrollMarginTop: 130 }}>
            <h2 className="mb-2.5 flex items-center gap-2 text-lg font-bold"><Icon name={ic} size={19} className="text-[var(--sos)]" />{titulo}</h2>
            <ul className="space-y-2">{itens.map((b, i) => <ContatoLinha key={b.id} b={b} index={i} />)}</ul>
          </section>
        )
      })}

      <p className="mx-5 mt-6 border-t border-black/5 pt-4 text-[13px] text-[var(--leve)]">
        Horários conferidos em fontes públicas. Viu algo errado? <a href="/mais#corrigir" className="inline-flex min-h-11 items-center font-semibold text-[var(--verde)] underline underline-offset-4">Avise a gente</a>.
      </p>
      <a href="tel:192" className="botao botao-sos mx-5 mt-4 w-[calc(100%-2rem)]"><Phone size={16} />Emergência médica: 192</a>
      <div className="h-4" />
    </Layout>
  )
}
