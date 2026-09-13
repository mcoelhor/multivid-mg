import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function Layout({ children, title, showBack = false, showSearch = false, onSearchClick, subtitle, hideHeader = false }) {
  return (
    <div className="flex flex-col min-h-dvh">
      {!hideHeader && (
        <Header
          title={title}
          showBack={showBack}
          showSearch={showSearch}
          onSearchClick={onSearchClick}
          subtitle={subtitle}
        />
      )}
      <main className="flex-1 pb-safe page-transition">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
