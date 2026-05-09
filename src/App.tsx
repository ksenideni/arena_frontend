import { BrowserRouter } from 'react-router-dom'
import { MainLayout } from './layout/MainLayout'
import { AppRoutes } from './router'

export function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  )
}
