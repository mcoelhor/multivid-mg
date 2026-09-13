import { AdminLayout } from './AdminLayout'
import { CATEGORIES } from '../data/categories'

export function AdminCategories() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Categorias</h2>
        <div className="space-y-3">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: cat.bg }}>
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.subcategories.length} subcategorias</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.subcategories.map(sub => (
                  <span key={sub.id} className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 rounded-full text-xs text-gray-600">
                    {sub.icon} {sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
