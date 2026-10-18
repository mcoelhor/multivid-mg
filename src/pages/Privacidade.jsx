import { useState } from 'react'
import { Layout } from '../components/Layout/Layout'
import { consentimento, guardarConsentimento } from '../lib/marketing'

/** Privacidade em linguagem simples: o que o guia guarda e o que a pessoa pode desligar. */
export function Privacidade() {
  const [c, setC] = useState(consentimento())
  const mudar = v => { guardarConsentimento(v); setC(v) }
  return (
    <Layout title="Privacidade" showBack>
      <div className="px-5 text-[16px] leading-relaxed">
        <p>O Monte Verde MG é um guia local. Não pedimos cadastro para usar e não vendemos dados.</p>
        <h2 className="mt-6 text-[20px] font-extrabold tracking-[-0.02em]">O que fica no seu aparelho</h2>
        <p className="mt-2">Favoritos, roteiro, escolhas de cookies e um código aleatório que muda todo dia, usado só para contar visitantes únicos. Nada disso identifica você.</p>
        <h2 className="mt-6 text-[20px] font-extrabold tracking-[-0.02em]">O que vai para o nosso servidor</h2>
        <p className="mt-2">Cliques em telefone, WhatsApp e rota (sem seu nome), buscas feitas, de onde veio o acesso (Instagram, Google, QR code), e os dados que você mesmo envia em formulários (cadastro de negócio, correções, pedido de plano) ou ao ligar avisos no celular (a assinatura de notificação).</p>
        <h2 className="mt-6 text-[20px] font-extrabold tracking-[-0.02em]">Localização</h2>
        <p className="mt-2">Só é usada quando você pede ("perto de mim" ou boas-vindas na vila) e não é guardada.</p>
        <h2 className="mt-6 text-[20px] font-extrabold tracking-[-0.02em]">Cookies de marketing</h2>
        <p className="mt-2">Com seu consentimento, o pixel da Meta e a tag do Google medem o uso e permitem mostrar o guia a quem está em Monte Verde no Instagram e no Google. Você pode mudar aqui:</p>
        <div className="mt-3 flex gap-2">
          <button onClick={() => mudar('essencial')} className={`botao h-11 min-h-0 flex-1 text-[15px] ${c === 'essencial' ? 'botao-pri' : 'botao-sec'}`}>Só o necessário</button>
          <button onClick={() => mudar('tudo')} className={`botao h-11 min-h-0 flex-1 text-[15px] ${c === 'tudo' ? 'botao-pri' : 'botao-sec'}`}>Aceitar marketing</button>
        </div>
        <h2 className="mt-6 text-[20px] font-extrabold tracking-[-0.02em]">Quem responde</h2>
        <p className="mt-2">Monte Verde MG · monteverdeapp@gmail.com. Para apagar algo que você enviou, escreva para esse e-mail.</p>
      </div>
    </Layout>
  )
}
