import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Rodape } from './Rodape'

export function Layout({ children, title, showBack = false, showSearch = false, onSearchClick, subtitle, hideHeader = false, tom, semRodape = false }) {
  const { pathname } = useLocation()
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
