import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Profile } from '../../api/types'

interface State {
  data: Profile | null
  loading: boolean
  error: string | null
}

export function useProfile(pollMs = 8000): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await api.profile()
        if (!cancelled) setState({ data, loading: false, error: null })
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: (e as Error).message }))
      }
    }
    load()
    const id = window.setInterval(load, pollMs)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [pollMs])

  return state
}
