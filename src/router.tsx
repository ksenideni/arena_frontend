import { Navigate, Route, Routes } from 'react-router-dom'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { LoginPage } from './pages/LoginPage'
import { MatchPage } from './pages/MatchPage'
import { MatchesPage } from './pages/MatchesPage'
import { ProfilePage } from './pages/ProfilePage'
import { RatingPage } from './pages/RatingPage'

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
      <Route path="/rating" element={<RatingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/matches" replace />} />
    </Routes>
  )
}
