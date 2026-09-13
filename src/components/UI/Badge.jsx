export function OpenBadge({ isOpen }) {
  if (isOpen === null || isOpen === undefined) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
      {isOpen ? 'Aberto' : 'Fechado'}
    </span>
  )
}

export function CategoryBadge({ name, color, bg }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg || '#F3F4F6', color: color || '#374151' }}
    >
      {name}
    </span>
  )
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
      ⭐ Destaque
    </span>
  )
}
