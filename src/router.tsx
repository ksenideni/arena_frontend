import { Navigate, Route, Routes } from 'react-router-dom'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { MatchPage } from './pages/MatchPage'
import { MatchesPage } from './pages/MatchesPage'

/**
 * Чтобы добавить новую вкладку (рейтинги, профили):
 *  1. Создать страницу в src/pages
 *  2. Добавить <Route> сюда
 *  3. Включить элемент в src/layout/tabs.ts (enabled: true)
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/matches" replace />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/match/:id" element={<MatchPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="*" element={<Navigate to="/matches" replace />} />
    </Routes>
  )
}
