import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { supabase } from '../lib/supabase'

function Lista({ titulo, sub, itens, cor }) {
  return (
    <section className="mt-3 rounded-2xl bg-white p-4">
      <h2 className="font-bold">{titulo}</h2>
      {sub && <p className="text-xs text-[#626a63]">{sub}</p>}
      {!itens?.length ? <p className="mt-2 text-sm text-[#626a63]">Nada no período.</p> : (
        <ol className="mt-2 divide-y divide-black/5">
          {itens.map(b => (
            <li key={b.term} className="flex items-center justify-between py-2 text-sm">
              <Link to={`/busca?q=${encodeURIComponent(b.term)}`} className="underline decoration-black/15 underline-offset-4">{b.term}</Link>
              <b className="num" style={{ color: cor }}>{b.vezes}</b>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function AdminBuscas() {
  const [dias, setDias] = useState(30)
  const [todas, setTodas] = useState(null)
  const [vazias, setVazias] = useState([])
  useEffect(() => {
    supabase.rpc('buscas', { dias, so_vazias: false }).then(({ data }) => setTodas(data || []))
    supabase.rpc('buscas', { dias, so_vazias: true }).then(({ data }) => setVazias(data || []))
  }, [dias])

  return (
    <AdminLayout>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {[[7, '7 dias'], [30, '30 dias'], [90, '90 dias']].map(([d, r]) => <button key={d} onClick={() => setDias(d)} className={`chip ${dias === d ? 'ativo' : ''}`}>{r}</button>)}
      </div>
      <Lista titulo="Sem resultado" sub="Cada termo é um turista que saiu sem resposta: é o que falta cadastrar." itens={vazias} cor="#8a3b2e" />
      <Lista titulo="Mais buscados" itens={todas} cor="var(--verde)" />
    </AdminLayout>
  )
}
