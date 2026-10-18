import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Calendar, Store, Settings, ArrowRight, Download, Route, Siren, Image } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { LeadForm } from '../components/LeadForm'
import { useInstalar } from '../hooks/useInstalar'

function Linha({ icon: I, label, onClick, destaque }) {
  return (
    <button onClick={onClick} className={`pressiona flex w-full items-center gap-4 rounded-[var(--raio)] p-4 text-left ${destaque ? 'bg-[var(--musgo)] text-white' : 'bg-[var(--papel)]'}`}>
      <I size={21} className={destaque ? 'text-[var(--broto)]' : 'text-[var(--musgo)]'} />
      <span className="flex-1 text-[17px] font-bold">{label}</span>
      <ArrowRight size={18} className={destaque ? 'text-white/70' : 'text-[var(--leve)]'} />
    </button>
  )
}

export function More() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { podeInstalar, instalar, ios } = useInstalar()
  useEffect(() => { if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120) }, [hash])

  return (
    <Layout title="Mais">
      <div className="space-y-2 px-5 pt-2">
        {(podeInstalar || ios) && (
          <Linha icon={Download} destaque label="Instalar o app no celular" onClick={() => (podeInstalar ? instalar() : alert('No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início".'))} />
        )}
        <Linha icon={Route} label="Meu roteiro" onClick={() => navigate('/roteiro')} />
        <Linha icon={Heart} label="Lugares salvos" onClick={() => navigate('/favoritos')} />
        <Linha icon={Calendar} label="Eventos" onClick={() => navigate('/eventos')} />
        <Linha icon={Siren} label="Emergência e contatos úteis" onClick={() => navigate('/sos')} />
        <Linha icon={Store} label="Anuncie seu negócio" onClick={() => navigate('/anuncie')} />
        <Linha icon={Store} label="Meu negócio (área do responsável)" onClick={() => navigate('/meu-negocio')} />
        <Linha icon={Image} label="Créditos das fotos" onClick={() => navigate('/creditos')} />
        <Linha icon={Settings} label="Área do administrador" onClick={() => navigate('/admin')} />
      </div>

      <section id="cadastro" className="px-5 pt-12" style={{ scrollMarginTop: 90 }}>
        <h2 className="titulo">Cadastro grátis</h2>
        <p className="mb-4 mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Tem comércio ou serviço em Monte Verde? Mande os dados e colocamos sua página no ar, sem custo.</p>
        <LeadForm empresa="portal" interesse="anunciar" botao="Quero meu cadastro grátis" />
      </section>

      <section id="corrigir" className="px-5 pt-12" style={{ scrollMarginTop: 90 }}>
        <h2 className="titulo">Achou algo errado?</h2>
        <p className="mb-4 mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Telefone que não atende, horário diferente, lugar que fechou: avise que a gente corrige.</p>
        <LeadForm empresa="portal" interesse="correcao" botao="Enviar correção" />
      </section>
    </Layout>
  )
}
