import { Link } from 'react-router-dom'
import { Car, Bus, Plane, TriangleAlert, Phone, ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { FOTOS } from '../data/fotos'
import { linkTel } from '../lib/track'

const CARRO = [
  ['São Paulo', '≈170 km · 2h30 a 3h', 'Dutra (BR-116) sentido Guarulhos, saída 227 para a Fernão Dias (BR-381). Em Camanducaia, saída 918 e mais 30 km de serra pela Rodovia Deputado Agostinho Patrus até a vila.'],
  ['Campinas', '≈165 km · 2h30', 'Dom Pedro I (SP-065) sentido Jacareí por 60 km, depois Fernão Dias sentido Belo Horizonte por 68 km até Camanducaia.'],
  ['Belo Horizonte', '≈480 km · 6h', 'Fernão Dias sentido São Paulo até Camanducaia (saída 918), depois os 30 km da estrada de Monte Verde.'],
  ['Rio de Janeiro', '≈480 a 560 km · 6h30 a 7h', 'Dutra até Jacareí, Dom Pedro I até Atibaia, Fernão Dias até Camanducaia. Conte com pedágios na Dutra e na Dom Pedro.'],
  ['Campos do Jordão', '≈140 km · 3h', 'MG-173 sentido São Bento do Sapucaí, MG-295 em Paraisópolis, Fernão Dias até Camanducaia.'],
]
const ONIBUS = [
  ['São Paulo (Tietê) → Camanducaia', 'Viação Cambuí', '≈3h', 'a partir de R$ 60'],
  ['Belo Horizonte → Pouso Alegre → Camanducaia', 'Expresso Gardenia + Viação Cambuí', '≈7h + 1h30', 'a partir de R$ 120 + R$ 39'],
  ['Rio → Pouso Alegre → Camanducaia', 'Viação Sampaio + Viação Cambuí', '≈7h + 1h30', 'a partir de R$ 190 + R$ 39'],
  ['Cambuí ou Extrema → Camanducaia', 'Viação Cambuí', '45 min', '≈R$ 14'],
]
const VAN_IDA = ['6h20', '7h40', '9h40', '11h30', '13h30', '15h', '17h']
const VAN_IDA_DOM = ['6h20', '7h50', '13h30', '15h', '17h']
const VAN_VOLTA = ['7h30', '9h30', '11h10', '12h50', '15h30', '16h45', '18h20']
const VAN_VOLTA_DOM = ['7h59', '9h30', '15h30', '17h', '18h20']

/** Como chegar a Monte Verde: carro, ônibus, van e avião, com o que muda na serra. */
export function ComoChegar() {
  return (
    <Layout title="Como chegar" subtitle="Monte Verde fica a 1.554 m, em Camanducaia, MG" showBack>
      <div className="mx-5 overflow-hidden rounded-[var(--raio)]">
        <img src={FOTOS.vistaAzul.g} srcSet={`${FOTOS.vistaAzul.p} 700w, ${FOTOS.vistaAzul.g} 1600w`} sizes="480px" alt={FOTOS.vistaAzul.legenda} className="aspect-[16/9] w-full object-cover" />
      </div>
      <div className="px-5">
        <p className="mt-5 text-[17px] leading-relaxed">Monte Verde não é cidade: é um distrito de Camanducaia, no alto da Serra da Mantiqueira, a 30 km da Fernão Dias. Todo caminho passa por Camanducaia e sobe a serra por uma estrada asfaltada de curvas.</p>

        <section className="mt-8" aria-labelledby="h-carro">
          <h2 id="h-carro" className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.02em]"><Car size={22} className="text-[var(--musgo)]" />De carro</h2>
          <ul className="mt-3 space-y-2">
            {CARRO.map(([de, tempo, como]) => (
              <li key={de} className="rounded-[var(--raio)] bg-[var(--papel)] p-4">
                <div className="flex items-baseline justify-between gap-3"><p className="text-[18px] font-extrabold tracking-[-0.02em]">{de}</p><p className="num shrink-0 text-[14px] font-bold text-[var(--musgo)]">{tempo}</p></div>
                <p className="mt-1 text-[15px] leading-snug text-[var(--leve)]">{como}</p>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-start gap-3 rounded-[var(--raio)] bg-[#f3e8cc] p-4 text-[#5a4206]">
            <TriangleAlert size={20} className="mt-0.5 shrink-0" />
            <p className="text-[15px] leading-snug"><b>Na serra:</b> 30 km de curvas, neblina comum à noite e de manhã cedo, e quase nada de sinal de celular em trechos. Suba com o tanque abastecido, faróis baixos na neblina e sem pressa. A vila tem postos e mecânicos, <Link to="/categoria/transporte" className="font-bold underline underline-offset-4">veja aqui</Link>.</p>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="h-onibus">
          <h2 id="h-onibus" className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.02em]"><Bus size={22} className="text-[var(--musgo)]" />De ônibus</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Não há ônibus direto para Monte Verde. Vai-se até Camanducaia e, de lá, de van.</p>
          <ul className="mt-3 divide-y divide-[var(--nevoa)] rounded-[var(--raio)] bg-[var(--papel)]">
            {ONIBUS.map(([trecho, emp, tempo, preco]) => (
              <li key={trecho} className="p-4"><p className="text-[16px] font-bold leading-tight">{trecho}</p><p className="mt-1 text-[14px] text-[var(--leve)]">{emp} · {tempo} · {preco}</p></li>
            ))}
          </ul>
          <div className="mt-3 rounded-[var(--raio)] bg-[var(--papel)] p-4">
            <p className="text-[16px] font-bold">Van Camanducaia ⇄ Monte Verde</p>
            <p className="mt-1 text-[14px] leading-snug text-[var(--leve)]">Cassalho Turismo · ≈1h · ≈R$ 18. Sai da praça principal de Camanducaia e, em Monte Verde, da esquina da Av. Sol Nascente com a Av. Monte Verde, em frente ao posto Ipiranga.</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
              <div><p className="font-bold">Camanducaia → Monte Verde</p><p className="num text-[var(--leve)]">Seg a sáb: {VAN_IDA.join(', ')}</p><p className="num text-[var(--leve)]">Dom e feriado: {VAN_IDA_DOM.join(', ')}</p></div>
              <div><p className="font-bold">Monte Verde → Camanducaia</p><p className="num text-[var(--leve)]">Seg a sáb: {VAN_VOLTA.join(', ')}</p><p className="num text-[var(--leve)]">Dom e feriado: {VAN_VOLTA_DOM.join(', ')}</p></div>
            </div>
            <a href={linkTel('3534312331')} className="botao botao-sec mt-3 h-11 min-h-0 w-full text-[15px]"><Phone size={16} />Confirmar horários: (35) 3431-2331</a>
            <p className="mt-2 text-[13px] text-[var(--leve)]">Horários e preços pesquisados em maio de 2025. Confirme antes de viajar.</p>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="h-aviao">
          <h2 id="h-aviao" className="flex items-center gap-2 text-[22px] font-extrabold tracking-[-0.02em]"><Plane size={22} className="text-[var(--musgo)]" />De avião</h2>
          <p className="mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Os aeroportos mais próximos são Guarulhos e Congonhas, em São Paulo, e Viracopos, em Campinas. De qualquer um deles, siga de carro alugado (≈2h30) ou ônibus até Camanducaia. O aeroporto de Monte Verde é só para voos panorâmicos e táxi aéreo.</p>
        </section>

        <section className="mt-8" aria-labelledby="h-chegando">
          <h2 id="h-chegando" className="text-[22px] font-extrabold tracking-[-0.02em]">Chegando na vila</h2>
          <ul className="mt-3 space-y-2 text-[16px] leading-relaxed">
            <li className="rounded-[var(--raio)] bg-[var(--papel)] p-4"><b>Estacionar:</b> a Avenida Monte Verde (o centrinho) tem pouca vaga nos fins de semana e feriados. Chegue cedo ou deixe o carro na pousada e vá a pé: o centro tem 1 km.</li>
            <li className="rounded-[var(--raio)] bg-[var(--papel)] p-4"><b>Táxi e aplicativo:</b> não há Uber ou 99 na vila e os táxis são poucos. Combine o preço antes. <Link to="/categoria/transporte/taxis" className="inline-flex items-center gap-1 font-bold text-[var(--musgo)]">Táxis cadastrados <ArrowRight size={15} /></Link></li>
            <li className="rounded-[var(--raio)] bg-[var(--papel)] p-4"><b>Sinal e dinheiro:</b> o sinal de celular falha fora do centro. Este guia funciona sem internet depois da primeira abertura. Há caixa eletrônico na vila; leve dinheiro para barracas e vans. <Link to="/uteis" className="inline-flex items-center gap-1 font-bold text-[var(--musgo)]">Serviços úteis <ArrowRight size={15} /></Link></li>
            <li className="rounded-[var(--raio)] bg-[var(--papel)] p-4"><b>Primeira coisa a fazer:</b> <Link to="/roteiro" className="font-bold text-[var(--musgo)] underline underline-offset-4">montar seu roteiro</Link> e ligar os avisos de chegada.</li>
          </ul>
        </section>
        <p className="mt-6 text-[13px] leading-relaxed text-[var(--leve)]">Fontes: guias Quero Viajar Mais e Viajei Bonito (2025) e cadastro do guia. Viu algo diferente na estrada? <Link to="/mais#corrigir" className="font-semibold underline underline-offset-4">Avise a gente</Link>.</p>
      </div>
    </Layout>
  )
}
