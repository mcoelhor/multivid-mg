import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Icon } from '../components/UI/Icon'
import { CATEGORIES } from '../data/categories'
import { FOTO_CATEGORIA } from '../data/fotos'
import { useBusinesses } from '../hooks/useBusinesses'

const ORDEM = ['alimentacao', 'hospedagem', 'turismo', 'compras', 'saude', 'transporte', 'servicos', 'construcao', 'imobiliarias']

export function Categories() {
  const [aberta, setAberta] = useState(null)
  const { businesses } = useBusinesses()
  const conta = (cat, sub) => businesses.filter(b => b.category === cat && (!sub || b.subcategory === sub)).length
  const cats = ORDEM.map(id => CATEGORIES.find(c => c.id === id)).filter(Boolean)

  return (
    <Layout title="Explorar" subtitle="Tudo o que tem na vila" showSearch>
      <div className="space-y-3 px-5 pt-2">
        {cats.map((c, i) => {
          const on = aberta === c.id
          const f = FOTO_CATEGORIA[c.id]
          return (
            <div key={c.id} className="entra overflow-hidden rounded-[var(--raio)] bg-[var(--papel)]" style={{ '--i': i }}>
              <button className="pressiona relative block w-full text-left" onClick={() => setAberta(on ? null : c.id)} aria-expanded={on}>
                <img src={f.p} alt="" loading={i < 3 ? 'eager' : 'lazy'} className="aspect-[16/7] w-full object-cover" />
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[22px] font-extrabold leading-tight tracking-[-0.02em]">{c.name} <span className="num text-[15px] font-bold text-[var(--leve)]">{conta(c.id) || ''}</span></span>
                    <span className="block truncate text-[15px] text-[var(--leve)]">{c.description}</span>
                  </span>
                  <ChevronDown size={20} className="shrink-0 text-[var(--leve)] transition-transform duration-200" style={{ transform: on ? 'rotate(180deg)' : 'none' }} />
                </div>
              </button>
              <div className={`abre ${on ? 'aberto' : ''}`}><div>
                <div className="px-4 pb-3">
                  <Link to={`/categoria/${c.slug}`} className="botao botao-pri h-11 min-h-0 w-full">Ver todos <ArrowRight size={17} /></Link>
                  {c.subcategories.filter(s => conta(c.id, s.id)).map(s => (
                    <Link key={s.id} to={`/categoria/${c.slug}/${s.slug}`} className="flex items-center gap-3 py-3 text-[16px] font-semibold">
                      <Icon name={s.icon} size={19} className="text-[var(--musgo)]" /><span className="flex-1">{s.name}</span>
                      <span className="num text-[14px] text-[var(--leve)]">{conta(c.id, s.id)}</span>
                    </Link>
                  ))}
                </div>
              </div></div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
