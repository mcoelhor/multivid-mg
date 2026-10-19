import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Rodape } from './Rodape'
import { TopNav } from './TopNav'

// Largura do conteúdo no computador: leitura (texto e formulários) ou largo (listas e grades)
export const LARGURA = { leitura: 'lg:mx-auto lg:w-full lg:max-w-[760px]', largo: 'lg:mx-auto lg:w-full lg:max-w-[1180px] lg:px-3', cheio: '' }

/** Título da aba e das buscas, por página. */
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Monte Verde MG` : 'Monte Verde MG · guia e roteiro da vila na serra'
  }, [titulo])
}

export function Layout({ children, title, showBack = false, showSearch = false, onSearchClick, subtitle, hideHeader = false, tom, semRodape = false, titulo, largura = 'leitura' }) {
  const { pathname } = useLocation()
  useTitulo(titulo ?? title)
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav />
      {!hideHeader && (
        <Header title={title} showBack={showBack} showSearch={showSearch} onSearchClick={onSearchClick} subtitle={subtitle} tom={tom} largura={LARGURA[largura]} />
      )}
      <main key={pathname} className={`page-transition flex-1 ${LARGURA[largura]} ${hideHeader ? '' : 'lg:pt-4'}`}>
        {children}
      </main>
      {!semRodape && <Rodape />}
      <div className="pb-safe lg:hidden" />
      <BottomNav />
    </div>
  )
}
