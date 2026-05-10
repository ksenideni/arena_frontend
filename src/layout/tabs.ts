/**
 * Конфиг навигации. Чтобы добавить новую вкладку (рейтинги, профили):
 *  1. Добавить элемент в массив TABS
 *  2. Добавить роут в router.tsx
 * Поле `enabled: false` оставляет пункт видимым в навигации, но недоступным.
 */

export interface TabConfig {
  id: string
  label: string
  to: string
  /** Префикс пути для подсветки активной вкладки */
  pathPrefix: string
  enabled: boolean
}

export const TABS: TabConfig[] = [
  { id: 'matches', label: 'Matches', to: '/matches', pathPrefix: '/match', enabled: true },
  { id: 'leaderboard', label: 'Leaderboard', to: '/leaderboard', pathPrefix: '/leaderboard', enabled: true },
  { id: 'profile', label: 'Profile', to: '/profile', pathPrefix: '/profile', enabled: false },
]
