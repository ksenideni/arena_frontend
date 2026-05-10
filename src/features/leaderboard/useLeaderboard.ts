import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { LeaderboardEntry } from '../../api/types'

interface State {
  data: LeaderboardEntry[]
  loading: boolean
  error: string | null
}

/**
 * Опрос /api/leaderboard по интервалу. Дешёво — это агрегатный SQL.
 * При желании можно отказаться от polling и вызывать только по ручному refresh.
 */
export function useLeaderboard(pollMs = 5000): State {
  const [state, setState] = useState<State>({ data: [], loading: true, error: null })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await api.leaderboard()
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: (e as Error).message }))
      }
    }

    load()
    const id = window.setInterval(load, pollMs)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [pollMs])

  return state
}
