import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Heart, Calendar, Store, Settings, ChevronRight, Download } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { LeadForm } from '../components/LeadForm'
import { useInstalar } from '../hooks/useInstalar'

function Linha({ icon: I, label, onClick, destaque }) {
  return (
    <button onClick={onClick} className="pressiona flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${destaque ? 'bg-[var(--verde)] text-white' : 'bg-[#e3efe6] text-[var(--verde)]'}`}><I size={19} /></span>
      <span className="flex-1 text-[15px] font-medium">{label}</span>
      <ChevronRight size={17} className="text-[#8a918b]" />
    </button>
  )
}

export function More() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { podeInstalar, instalar, ios } = useInstalar()
  useEffect(() => { if (hash) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }) }, [hash])

  return (
    <Layout title="Mais">
      <div className="space-y-2 px-4 pt-4">
        {(podeInstalar || ios) && (
          <Linha icon={Download} destaque label="Instalar o app no celular" onClick={() => (podeInstalar ? instalar() : alert('No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início".'))} />
        )}
        <Linha icon={Heart} label="Meus favoritos" onClick={() => navigate('/favoritos')} />
        <Linha icon={Calendar} label="Eventos" onClick={() => navigate('/eventos')} />
        <Linha icon={Store} label="Cadastrar meu negócio" onClick={() => navigate('/anuncie')} />
        <Linha icon={Settings} label="Área do administrador" onClick={() => navigate('/admin')} />
      </div>

      <section id="corrigir" className="px-4 pt-6" style={{ scrollMarginTop: 80 }}>
        <h2 className="mb-1 text-lg font-bold">Achou algo errado?</h2>
        <p className="mb-3 text-sm text-[#626a63]">Telefone que não atende, horário diferente, lugar que fechou: avise que a gente corrige.</p>
        <LeadForm empresa="portal" interesse="correcao" botao="Enviar correção" />
      </section>

      <section className="mx-4 mt-6 rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(160deg, var(--verde), var(--verde-escuro))' }}>
        <h3 className="text-lg font-bold">Portal Monte Verde</h3>
        <p className="mt-1 text-sm text-white/80">O que você precisa em Monte Verde, com quem está aberto agora. Do jantar ao dente quebrado.</p>
        <p className="mt-3 text-xs text-white/60">monteverdemg.com.br · Monte Verde e Camanducaia, MG</p>
      </section>
      <div className="h-4" />
    </Layout>
  )
}
