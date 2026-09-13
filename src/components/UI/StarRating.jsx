export function StarRating({ rating, count, size = 'sm' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  const sz = size === 'sm' ? 12 : 16

  return (
    <span className="flex items-center gap-1">
      <span className="flex">
        {Array(full).fill(0).map((_, i) => (
          <svg key={`f${i}`} width={sz} height={sz} viewBox="0 0 24 24" fill="#FBBF24">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
        {half && (
          <svg width={sz} height={sz} viewBox="0 0 24 24">
            <defs><clipPath id="h"><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#E5E7EB" />
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#FBBF24" clipPath="url(#h)" />
          </svg>
        )}
        {Array(empty).fill(0).map((_, i) => (
          <svg key={`e${i}`} width={sz} height={sz} viewBox="0 0 24 24" fill="#E5E7EB">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </span>
      <span className={`font-semibold text-gray-800 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{rating.toFixed(1)}</span>
      {count != null && (
        <span className={`text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>({count})</span>
      )}
    </span>
  )
}
