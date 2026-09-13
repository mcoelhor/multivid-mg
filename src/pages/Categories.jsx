import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Layout } from '../components/Layout/Layout'
import { CATEGORIES } from '../data/categories'

export function Categories() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(null)

  return (
    <Layout title="Categorias" showSearch>
      <div className="px-4 pt-4 pb-4">
        <div className="space-y-3">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <button
                className="w-full flex items-center gap-4 p-4"
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: cat.bg }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-400 transition-transform"
                  style={{ transform: expanded === cat.id ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </button>

              {expanded === cat.id && (
                <div className="border-t border-gray-50 px-4 pb-3">
                  <button
                    onClick={() => navigate(`/categoria/${cat.slug}`)}
                    className="w-full flex items-center justify-between py-2.5 border-b border-gray-50"
                  >
                    <span className="text-sm font-semibold text-gray-800">Ver todos em {cat.name}</span>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                  <div className="grid grid-cols-2 gap-0">
                    {cat.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => navigate(`/categoria/${cat.slug}/${sub.slug}`)}
                        className="flex items-center gap-2.5 py-2.5 pr-2"
                      >
                        <span className="text-base">{sub.icon}</span>
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
