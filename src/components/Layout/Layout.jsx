import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Rodape } from './Rodape'

/** Título da aba e das buscas, por página. */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Monte Verde MG` : 'Monte Verde MG · guia e roteiro da vila na serra'
  }, [titulo])
}

export function Layout({ children, title, showBack = false, showSearch = false, onSearchClick, subtitle, hideHeader = false, tom, semRodape = false, titulo }) {
  const { pathname } = useLocation()
  useTitulo(titulo ?? title)
  return (
    <div className="flex min-h-dvh flex-col">
      {!hideHeader && (
        <Header title={title} showBack={showBack} showSearch={showSearch} onSearchClick={onSearchClick} subtitle={subtitle} tom={tom} />
      )}
      <main key={pathname} className="page-transition flex-1">
        {children}
      </main>
      {!semRodape && <Rodape />}
      <div className="pb-safe" />
      <BottomNav />
    </div>
  )
}
