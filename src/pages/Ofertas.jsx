import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'
import { CartaoOferta } from '../components/Oferta'
import { useOfertas } from '../hooks/useOfertas'
import { useBusinesses } from '../hooks/useBusinesses'

/** Todas as ofertas ativas dos estabelecimentos verificados. */
export function Ofertas() {
  const { ofertas, carregado } = useOfertas()
  const { businesses } = useBusinesses({})
  const porId = new Map(businesses.map(b => [b.id, b]))
  const lista = ofertas.filter(o => porId.has(o.business_id))
  return (
    <Layout title="Ofertas" subtitle="Mostre a tela no balcão" showBack>
      <div className="px-5">
        {!carregado ? <div className="esqueleto h-32 rounded-[var(--raio)]" /> : lista.length === 0 ? (
          <div className="rounded-[var(--raio)] bg-[var(--papel)] p-6">
            <p className="text-[18px] font-bold">Nenhuma oferta ativa agora.</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--leve)]">As ofertas são criadas pelos próprios estabelecimentos verificados. Tem um negócio na vila? <Link to="/anuncie#meu-negocio" className="font-bold text-[var(--musgo)] underline underline-offset-4">Confirme que é seu</Link> e publique a sua.</p>
          </div>
        ) : (
          <div className="space-y-3">{lista.map((o, k) => <div key={o.id} className="entra" style={{ '--i': k }}><CartaoOferta oferta={o} lugar={porId.get(o.business_id)} mostrarLugar /></div>)}</div>
        )}
        <p className="mt-6 text-[14px] leading-relaxed text-[var(--leve)]">Cada oferta é de responsabilidade do estabelecimento, que define as condições. O guia registra os usos para o comerciante acompanhar.</p>
      </div>
    </Layout>
  )
}
