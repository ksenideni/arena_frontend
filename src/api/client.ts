import type { MatchDetail, MatchSummary } from './types'

/**
 * Базовый URL бэкенда. Бэк деплоится отдельно — задавай через
 * переменную окружения VITE_API_BASE при сборке/запуске Vite.
 *
 *  Dev:    можно оставить пустым и пользоваться vite proxy (см. vite.config.ts) —
 *          фронт будет ходить на тот же origin.
 *  Prod:   укажи полный URL: VITE_API_BASE=https://arena.example.com
 */
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path)
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`)
  return (await res.json()) as T
}

export const api = {
  listMatches: (): Promise<MatchSummary[]> => getJson('/api/matches'),
  getMatch: (id: string): Promise<MatchDetail> => getJson(`/api/matches/${encodeURIComponent(id)}`),
}

/**
 * Ws URL: если задан VITE_API_BASE — конвертируем http→ws (https→wss); иначе
 * используем same-origin (с прицелом на vite proxy).
 */
export function liveSocketUrl(matchId: string): string {
  if (API_BASE) {
    const wsBase = API_BASE.replace(/^http/, 'ws')
    return `${wsBase}/api/matches/${encodeURIComponent(matchId)}/live`
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/api/matches/${encodeURIComponent(matchId)}/live`
}
