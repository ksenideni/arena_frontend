import type { AuthResponse, LeaderboardEntry, MatchDetail, MatchSummary, Profile } from './types'

/**
 * Базовый URL бэкенда. Бэк деплоится отдельно — задавай через
 * переменную окружения VITE_API_BASE при сборке/запуске Vite.
 *
 *  Dev:    можно оставить пустым и пользоваться vite proxy (см. vite.config.ts) —
 *          фронт будет ходить на тот же origin.
 *  Prod:   укажи полный URL: VITE_API_BASE=https://arena.example.com
 */
const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

/**
 * JWT хранится в localStorage. Каждый запрос подмешивает Bearer-токен, если он есть.
 * Для logout-а просто удаляем ключ.
 */
const TOKEN_KEY = 'arena.token'

export const auth = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string | null) => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  },
}

function authHeaders(): HeadersInit {
  const t = auth.getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE + path, { headers: authHeaders() })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`)
  return (await res.json()) as T
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export const api = {
  listMatches: (): Promise<MatchSummary[]> => getJson('/api/matches'),
  getMatch: (id: string): Promise<MatchDetail> => getJson(`/api/matches/${encodeURIComponent(id)}`),
  leaderboard: (): Promise<LeaderboardEntry[]> => getJson('/api/leaderboard'),

  login: (login: string, password: string): Promise<AuthResponse> =>
    postJson('/api/auth/login', { login, password }),
  register: (login: string, password: string, displayName?: string): Promise<AuthResponse> =>
    postJson('/api/auth/register', { login, password, displayName }),
  profile: (): Promise<Profile> => getJson('/api/me/profile'),
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
