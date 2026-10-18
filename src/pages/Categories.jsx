import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { Icon } from '../components/UI/Icon'
import { CATEGORIES } from '../data/categories'
import { useBusinesses } from '../hooks/useBusinesses'

export function Categories() {
  const [aberta, setAberta] = useState(null)
  const { businesses } = useBusinesses()
  const conta = (cat, sub) => businesses.filter(b => b.category === cat && (!sub || b.subcategory === sub)).length

  return (
    <Layout title="Categorias" showSearch>
      <div className="space-y-2 px-4 pt-4">
        {CATEGORIES.map((c, i) => {
          const on = aberta === c.id
          return (
            <div key={c.id} className="entra overflow-hidden rounded-2xl bg-white" style={{ '--i': i }}>
              <button className="pressiona flex w-full items-center gap-3.5 p-4 text-left" onClick={() => setAberta(on ? null : c.id)} aria-expanded={on}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: c.tint }}><Icon name={c.icon} size={21} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{c.name} <span className="num text-xs font-medium text-[#8a918b]">{conta(c.id) || ''}</span></span>
                  <span className="block truncate text-[13px] text-[#626a63]">{c.description}</span>
                </span>
                <ChevronDown size={18} className="text-[#8a918b] transition-transform duration-200" style={{ transform: on ? 'rotate(180deg)' : 'none' }} />
              </button>
              <div className={`abre ${on ? 'aberto' : ''}`}><div>
                <div className="border-t border-black/5 px-4 pb-2">
                  <Link to={`/categoria/${c.slug}`} className="flex items-center justify-between py-3 text-sm font-semibold text-[var(--verde)]">Ver todos <ChevronRight size={16} /></Link>
                  {c.subcategories.filter(s => conta(c.id, s.id)).map(s => (
                    <Link key={s.id} to={`/categoria/${c.slug}/${s.slug}`} className="flex items-center gap-3 py-2.5 text-[14px]">
                      <Icon name={s.icon} size={17} className="text-[#626a63]" /><span className="flex-1">{s.name}</span>
                      <span className="num text-xs text-[#8a918b]">{conta(c.id, s.id)}</span>
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
