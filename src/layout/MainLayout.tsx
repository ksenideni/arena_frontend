import type { ReactNode } from 'react'
import { TabBar } from './TabBar'

interface Props { children: ReactNode }

export function MainLayout({ children }: Props) {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">ARENA</h1>
        <TabBar />
      </header>
      <main className="app__main">{children}</main>
    </div>
  )
}
