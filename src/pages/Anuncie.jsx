import { Check } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { LeadForm } from '../components/LeadForm'

const PLANOS = [
  { nome: 'Gratuito', itens: ['Página com endereço, telefone e WhatsApp', 'Horário e selo “aberto agora”', 'Aparece na busca por problema'] },
  { nome: 'Destaque', itens: ['Tudo do gratuito', 'Fotos e descrição completa', 'Relatório mensal: visitas, ligações, WhatsApp e rotas'] },
  { nome: 'Parceiro', destaque: true, itens: ['Tudo do Destaque', 'Prioridade na sua categoria, com selo “Parceiro”', 'Presença na página inicial'] },
]

export function Anuncie() {
  return (
    <Layout title="Seu negócio no portal" showBack>
      <div className="px-4 pt-4">
        <p className="text-[15px] text-[#3f4a43]">Quem chega em Monte Verde procura aqui farmácia, jantar, mecânico e pousada. O cadastro básico é gratuito.</p>
        <div className="mt-4 space-y-2">
          {PLANOS.map((p, i) => (
            <div key={p.nome} className="entra rounded-2xl bg-white p-4" style={{ '--i': i, boxShadow: p.destaque ? 'inset 0 4px 0 var(--ouro)' : undefined }}>
              <h3 className="text-[17px] font-bold">{p.nome}</h3>
              <ul className="mt-2 space-y-1.5">
                {p.itens.map(t => <li key={t} className="flex gap-2 text-sm text-[#3f4a43]"><Check size={16} className="mt-0.5 shrink-0 text-[var(--verde)]" />{t}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5"><LeadForm empresa="portal" interesse="anunciar" titulo="Quero cadastrar meu negócio" botao="Enviar cadastro" /></div>
        <p className="mt-3 text-[13px] text-[#626a63]">Parceiros pagos são sempre identificados no portal.</p>
      </div>
    </Layout>
  )
}
