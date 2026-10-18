import { useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Heart, Calendar, Store, Settings, ArrowRight, Download, Route, Siren, Image, Car, Leaf, Ticket, Shield } from 'lucide-react'
import { Autocadastro } from '../components/Autocadastro'
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
  const [params] = useSearchParams()
  const lugar = params.get('lugar'), campoErrado = params.get('campo')
  const CAMPOS = { telefone: 'o telefone', horario: 'o horário', endereco: 'o endereço', fechou: 'fechou de vez' }
  const inicial = lugar ? `Lugar: ${lugar}${campoErrado ? ` · corrigir ${CAMPOS[campoErrado] || campoErrado}` : ''}. Informação certa: ` : ''
  const { podeInstalar, instalar, ios } = useInstalar()
  useEffect(() => { if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }), 120) }, [hash])

  return (
    <Layout title="Mais">
      <div className="space-y-2 px-5 pt-2">
        {(podeInstalar || ios) && (
          <Linha icon={Download} destaque label="Instalar o app no celular" onClick={() => (podeInstalar ? instalar() : alert('No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início".'))} />
        )}
        <Linha icon={Route} label="Meu roteiro" onClick={() => navigate('/roteiro')} />
        <Linha icon={Car} label="Como chegar a Monte Verde" onClick={() => navigate('/como-chegar')} />
        <Linha icon={Leaf} label="O que está na época" onClick={() => navigate('/epoca')} />
        <Linha icon={Ticket} label="Ofertas" onClick={() => navigate('/ofertas')} />
        <Linha icon={Heart} label="Lugares salvos" onClick={() => navigate('/favoritos')} />
        <Linha icon={Calendar} label="Eventos" onClick={() => navigate('/eventos')} />
        <Linha icon={Siren} label="Emergência e contatos úteis" onClick={() => navigate('/sos')} />
        <Linha icon={Store} label="Anuncie seu negócio" onClick={() => navigate('/anuncie')} />
        <Linha icon={Store} label="Meu negócio (área do responsável)" onClick={() => navigate('/meu-negocio')} />
        <Linha icon={Image} label="Créditos das fotos" onClick={() => navigate('/creditos')} />
        <Linha icon={Shield} label="Privacidade" onClick={() => navigate('/privacidade')} />
        <Linha icon={Settings} label="Área do administrador" onClick={() => navigate('/admin')} />
      </div>

      <section id="cadastro" className="px-5 pt-12" style={{ scrollMarginTop: 90 }}>
        <h2 className="titulo">Cadastro grátis</h2>
        <p className="mb-4 mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Tem comércio ou serviço em Monte Verde? Preencha e sua página entra no ar depois de uma conferência rápida, sem custo.</p>
        <Autocadastro />
      </section>

      <section id="corrigir" className="px-5 pt-12" style={{ scrollMarginTop: 90 }}>
        <h2 className="titulo">Achou algo errado?</h2>
        <p className="mb-4 mt-2 text-[16px] leading-relaxed text-[var(--leve)]">Telefone que não atende, horário diferente, lugar que fechou: avise que a gente corrige.</p>
        <LeadForm key={inicial} empresa="portal" interesse="correcao" botao="Enviar correção" inicial={inicial} />
      </section>
    </Layout>
  )
}
